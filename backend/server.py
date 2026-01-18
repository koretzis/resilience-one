import uvicorn
from fastapi import FastAPI
import socketio
from owlready2 import *
import os
import time
import pandas as pd
import joblib
import asyncio

# --- 1. SETUP & LOADING ---
java_path = r"C:\Program Files\Microsoft\jdk-25.0.1.8-hotspot\bin\java.exe"
if os.path.exists(java_path): owlready2.JAVA_EXE = java_path

# Load ML Model & Data
print("🧠 Loading AI Brain...")
ml_model = joblib.load("failure_predictor.pkl")
scenario_data = pd.read_csv("elpida_scenario.csv")
data_iterator = 0 # Δείκτης για το ποια γραμμή του CSV διαβάζουμε

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
app.mount('/', socketio.ASGIApp(sio, app))

# --- 2. ONTOLOGY (Standard) ---
onto = get_ontology("resilience.owl").load()
with onto:
    class InfrastructureNode(Thing): pass
    class PowerSubstation(InfrastructureNode): pass
    class CriticalAsset(InfrastructureNode): pass
    class BackupGenerator(InfrastructureNode): pass
    class FailedNode(InfrastructureNode): pass
    class OverloadedNode(InfrastructureNode): pass
    class LowFuelGenerator(InfrastructureNode): pass
    class GridUnstable(InfrastructureNode): pass
    class TotalBlackout(InfrastructureNode): pass

    class supplies(ObjectProperty): domain = [PowerSubstation]; range = [CriticalAsset]
    class has_backup(ObjectProperty): domain = [CriticalAsset]; range = [BackupGenerator]
    class is_redundant_to(ObjectProperty): domain = [PowerSubstation]; range = [PowerSubstation]

    # Rules (Load existing rules from file)
    # (Rules are already inside resilience.owl if you ran create_ontology.py)

# Instances
syntagma = PowerSubstation("sub-syntagma")
omonia = PowerSubstation("sub-omonia")
evangelismos = CriticalAsset("hosp-evangelismos")
gen = BackupGenerator("gen-evangelismos")
syntagma.supplies.append(evangelismos)
omonia.is_redundant_to.append(syntagma)
evangelismos.has_backup.append(gen)

# --- 3. REAL ATHENS TOPOLOGY (Mocked OSM Data) ---
# Πραγματικές τοποθεσίες υποσταθμών για το χάρτη
REAL_NODES = [
    {"id": "sub-syntagma", "lat": 37.9755, "lng": 23.7348, "name": "Syntagma HV"},
    {"id": "sub-omonia",   "lat": 37.9841, "lng": 23.7280, "name": "Omonia Backup"},
    {"id": "sub-pagrati",  "lat": 37.9670, "lng": 23.7450, "name": "Pagrati Node"},
    {"id": "sub-kypseli",  "lat": 38.0010, "lng": 23.7390, "name": "Kypseli HV"},
    {"id": "sub-gazi",     "lat": 37.9780, "lng": 23.7120, "name": "Gazi Plant"},
    {"id": "hosp-evangelismos", "lat": 37.9770, "lng": 23.7480, "name": "Evangelismos Hosp"}
]

active_sid = None

def reset_logic():
    syntagma.is_a = [PowerSubstation]
    omonia.is_a = [PowerSubstation]
    gen.is_a = [BackupGenerator]
    evangelismos.is_a = [CriticalAsset]
    try:
        with onto: sync_reasoner(infer_property_values=True)
    except: pass

@sio.event
async def connect(sid, environ):
    global active_sid, data_iterator
    active_sid = sid
    data_iterator = 0 # Restart scenario
    reset_logic()
    print(f"👋 New Connection: {sid}. Starting 'Elpida' Scenario Replay.")
    
    # Send Topology Info ONCE
    await sio.emit('topology_init', REAL_NODES)

@sio.event
async def request_next_step(sid):
    global data_iterator, active_sid
    if sid != active_sid: return

    # 1. READ NEXT ROW FROM CSV
    if data_iterator >= len(scenario_data): data_iterator = 0 # Loop back
    row = scenario_data.iloc[data_iterator]
    data_iterator += 5 # Skip 5 minutes per tick (Fast Forward)

    temp_val = row['temperature']
    load_val = row['grid_load']
    
    # 2. ML PREDICTION (Scikit-Learn)
    # Προβλέπουμε την πιθανότητα βλάβης (Risk Probability)
    risk_prob = ml_model.predict_proba([[temp_val, load_val]])[0][1] # Probability of Class 1
    risk_percent = round(risk_prob * 100, 1)

    # 3. ONTOLOGY LOGIC (Based on values)
    # Map CSV values to Ontology thresholds
    # Στο CSV, το load φτάνει 100. Εμείς θέλουμε >90 για failure.
    inference_needed = False
    
    # Syntagma Logic (Temp Based)
    # Πλασματική μετατροπή: Αν στο CSV η temp < 0, τότε ο υποσταθμός υπερθερμαίνεται λόγω φορτίου
    syn_status = temp_val
    if temp_val < 0.5 and FailedNode not in syntagma.is_a:
        syntagma.is_a.append(FailedNode); inference_needed = True
    elif temp_val >= 0.5 and FailedNode in syntagma.is_a:
        syntagma.is_a.remove(FailedNode)

    # Omonia Logic (Load Based)
    if load_val > 90 and OverloadedNode not in omonia.is_a:
        omonia.is_a.append(OverloadedNode); inference_needed = True
    elif load_val <= 90 and OverloadedNode in omonia.is_a:
        omonia.is_a.remove(OverloadedNode)

    # Generator Logic (Hardcoded for demo end-game)
    gen_fuel = 100
    if data_iterator > 1000: gen_fuel = 15 # Στο τέλος του σεναρίου αδειάζει

    if gen_fuel < 20 and LowFuelGenerator not in gen.is_a:
         gen.is_a.append(LowFuelGenerator); inference_needed = True

    # 4. REASONING
    alert_msg = None
    alert_type = None
    
    if inference_needed:
        try:
            with onto: sync_reasoner(infer_property_values=True)
            if TotalBlackout in evangelismos.is_a:
                alert_type = "CRITICAL"
                alert_msg = "TOTAL BLACKOUT! Generator Dead."
            elif GridUnstable in evangelismos.is_a:
                alert_type = "WARNING"
                alert_msg = "Grid Lost. Running on Backup."
        except: pass

    # 5. CONSTRUCT PACKET
    payload = {
        'timestamp': str(row['timestamp']),
        'metrics': [
            {'id': 'sub-syntagma', 'val': temp_val, 'type': 'temp'},
            {'id': 'sub-omonia', 'val': load_val, 'type': 'load'},
            {'id': 'gen-evangelismos', 'val': gen_fuel, 'type': 'fuel'}
        ],
        'prediction': {
            'risk_percent': risk_percent,
            'msg': f"ML Prediction: {risk_percent}% chance of failure in 1h"
        },
        'alert': {'type': alert_type, 'msg': alert_msg} if alert_type else None
    }

    await sio.emit('simulation_step', payload)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5050)