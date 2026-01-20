import uvicorn
from fastapi import FastAPI
import socketio
from owlready2 import *
import os
import pandas as pd
import joblib

# ... (Java Path setup remains same) ...
java_path = r"C:\Program Files\Microsoft\jdk-25.0.1.8-hotspot\bin\java.exe"
if os.path.exists(java_path): owlready2.JAVA_EXE = java_path

# Load Advanced Assets
print("🧠 Loading Digital Twin Models...")
ml_model = joblib.load("advanced_brain.pkl")
scenario_data = pd.read_csv("scenario_realism.csv")
data_iterator = 0 

def build_model_input(temp, l_syn, l_kyp):
    if hasattr(ml_model, "feature_names_in_"):
        cols = list(ml_model.feature_names_in_)
    else:
        cols = ["temp_ambient", "load_syntagma", "load_kypseli"]
    values = {
        "temp_ambient": temp,
        "load_syntagma": l_syn,
        "load_kypseli": l_kyp,
    }
    return pd.DataFrame([[values.get(col) for col in cols]], columns=cols)

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
app.mount('/', socketio.ASGIApp(sio, app))

# ... (Ontology Setup remains same - load resilience.owl) ...
onto = get_ontology("resilience.owl").load()
with onto:
    # Εδώ θα μπορούσαμε να προσθέσουμε κανόνες για "Parent-Child Overload"
    # Προς το παρόν κρατάμε τη βασική λογική για να μην σπάσει
    pass 

# Instances
with onto:
    syntagma = onto.PowerSubstation("sub-syntagma")
    omonia = onto.PowerSubstation("sub-omonia")
    evangelismos = onto.CriticalAsset("hosp-evangelismos")
    gen = onto.BackupGenerator("gen-evangelismos")
    
    # Semantic Tags classes (reference)
    FailedNode = onto.FailedNode
    OverloadedNode = onto.OverloadedNode
    LowFuelGenerator = onto.LowFuelGenerator
    GridUnstable = onto.GridUnstable
    TotalBlackout = onto.TotalBlackout

# --- REAL TOPOLOGY ---
REAL_NODES = [
    {"id": "sub-syntagma", "lat": 37.9755, "lng": 23.7348, "name": "Syntagma HV (Parent)"},
    {"id": "sub-kypseli",  "lat": 38.0010, "lng": 23.7390, "name": "Kypseli HV (Parent)"},
    {"id": "sub-omonia",   "lat": 37.9841, "lng": 23.7280, "name": "Omonia MV (Backup)"},
    {"id": "sub-pagrati",  "lat": 37.9670, "lng": 23.7450, "name": "Pagrati MV (Res)"},
    {"id": "sub-gazi",     "lat": 37.9780, "lng": 23.7120, "name": "Gazi MV (Ind)"},
    {"id": "hosp-evangelismos", "lat": 37.9770, "lng": 23.7480, "name": "Evangelismos Hosp"}
]

active_sid = None

@sio.event
async def connect(sid, environ):
    global active_sid, data_iterator
    active_sid = sid
    data_iterator = 0 # Start from 00:00
    print(f"👋 Connected: {sid}. Starting High-Fidelity Simulation.")
    await sio.emit('topology_init', REAL_NODES)

@sio.event
async def request_next_step(sid):
    global data_iterator, active_sid
    if sid != active_sid: return

    # Loop Scenario
    if data_iterator >= len(scenario_data): data_iterator = 0
    
    # Read Row
    row = scenario_data.iloc[data_iterator]
    # Fast Forward: Πηδάμε 10 λεπτά ανά tick για να δούμε το 24ωρο γρήγορα
    data_iterator += 10 

    # --- VALUES ---
    temp = row['temp_ambient']
    l_syn = row['load_syntagma']
    l_kyp = row['load_kypseli']
    l_omo = row['load_omonia']
    l_pag = row['load_pagrati']
    l_gaz = row['load_gazi']
    fuel = row['gen_fuel']

    # --- ML PREDICTION ---
    # Προβλέπουμε βάσει των HV κόμβων και καιρού
    model_input = build_model_input(temp, l_syn, l_kyp)
    risk_prob = ml_model.predict_proba(model_input)[0][1]
    risk_percent = round(risk_prob * 100, 1)

    # --- ONTOLOGY LOGIC ---
    # Syntagma Fails if Temp < 0 AND Load > 95 (Extreme Stress)
    inference_needed = False
    
    # Logic: Syntagma Overheat/Stress
    if l_syn > 95 and temp < 0 and FailedNode not in syntagma.is_a:
        syntagma.is_a.append(FailedNode); inference_needed = True
    elif (l_syn <= 95 or temp >= 0) and FailedNode in syntagma.is_a:
        syntagma.is_a.remove(FailedNode)

    # Logic: Omonia Overloaded (Backup Stress)
    if l_omo > 90 and OverloadedNode not in omonia.is_a:
        omonia.is_a.append(OverloadedNode); inference_needed = True
    elif l_omo <= 90 and OverloadedNode in omonia.is_a:
        omonia.is_a.remove(OverloadedNode)

    # Logic: Generator
    if fuel < 20 and LowFuelGenerator not in gen.is_a:
        gen.is_a.append(LowFuelGenerator); inference_needed = True

    # REASONER
    alert_type, alert_msg = None, None
    if inference_needed:
        try:
            with onto: sync_reasoner(infer_property_values=True)
            if TotalBlackout in evangelismos.is_a:
                alert_type, alert_msg = "CRITICAL", "TOTAL BLACKOUT! Grid & Backup Failed."
            elif GridUnstable in evangelismos.is_a:
                alert_type, alert_msg = "WARNING", "Grid Instability Detected."
        except: pass

    # --- PACKET CONSTRUCTION ---
    metrics = [
        {'id': 'sub-syntagma', 'val': temp,  'type': 'Amb. Temp (°C)'}, # HV 1
        {'id': 'sub-kypseli',  'val': l_kyp, 'type': 'Load (%)'},     # HV 2
        {'id': 'sub-omonia',   'val': l_omo, 'type': 'Load (%)'},     # MV 1
        {'id': 'sub-pagrati',  'val': l_pag, 'type': 'Load (%)'},     # MV 2 (Res)
        {'id': 'sub-gazi',     'val': l_gaz, 'type': 'Load (%)'},     # MV 3 (Comm)
        {'id': 'gen-evangelismos', 'val': fuel, 'type': 'Fuel (%)'}
    ]

    payload = {
        'timestamp': str(row['timestamp']),
        'metrics': metrics,
        'prediction': {
            'risk_percent': risk_percent,
            'msg': f"Grid Stress Probability: {risk_percent}%"
        },
        'alert': {'type': alert_type, 'msg': alert_msg} if alert_type else None
    }

    await sio.emit('simulation_step', payload)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5050)