import uvicorn
from fastapi import FastAPI
import socketio
from owlready2 import *
import os
import pandas as pd
import joblib

# --- CONFIGURATION ---
java_path = r"C:\Program Files\Microsoft\jdk-25.0.1.8-hotspot\bin\java.exe" # <-- ΠΡΟΣΟΧΗ ΣΤΟ PATH
if os.path.exists(java_path):
    owlready2.JAVA_EXE = java_path

# Load Models
ml_model = joblib.load("advanced_brain.pkl")
scenario_data = pd.read_csv("scenario_realism.csv")
data_iterator = 0 

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
app.mount('/', socketio.ASGIApp(sio, app))

# --- ONTOLOGY LOADING ---
print("🏗️  Loading Ontology...")
onto = get_ontology("resilience.owl").load()

with onto:
    # Σύνδεση με τις κλάσεις της οντολογίας
    FailedNode = onto.FailedNode
    TotalBlackout = onto.TotalBlackout
    GridUnstable = onto.GridUnstable
    LowFuelGenerator = onto.LowFuelGenerator

    # Σύνδεση με τα Instances ( Individuals)
    syntagma = onto["sub-syntagma"]
    omonia = onto["sub-omonia"]
    evangelismos = onto["hosp-evangelismos"]
    gen = onto["gen-evangelismos"]

if not syntagma:
    print("❌ CRITICAL ERROR: Instances not found in OWL file!")

# --- SIMULATION TOPOLOGY ---
REAL_NODES = [
    {"id": "sub-syntagma", "lat": 37.9755, "lng": 23.7348, "name": "Syntagma HV"},
    {"id": "sub-kypseli",  "lat": 38.0010, "lng": 23.7390, "name": "Kypseli HV"},
    {"id": "sub-omonia",   "lat": 37.9841, "lng": 23.7280, "name": "Omonia MV"},
    {"id": "sub-pagrati",  "lat": 37.9670, "lng": 23.7450, "name": "Pagrati MV"},
    {"id": "sub-gazi",     "lat": 37.9780, "lng": 23.7120, "name": "Gazi MV"},
    {"id": "hosp-evangelismos", "lat": 37.9770, "lng": 23.7480, "name": "Evangelismos Hosp"}
]

@sio.event
async def connect(sid, environ):
    global data_iterator
    data_iterator = 0
    await sio.emit('topology_init', REAL_NODES)

@sio.event
async def request_next_step(sid):
    global data_iterator
    if data_iterator >= len(scenario_data): data_iterator = 0
    
    row = scenario_data.iloc[data_iterator]
    data_iterator += 10

    # 1. NEURO (ML Prediction)
    temp = row['temp_ambient']
    l_syn = row['load_syntagma']
    risk_prob = ml_model.predict_proba([[temp, l_syn, row['load_kypseli']]])[0][1]

    # 2. SYMBOLIC (Ontology Reasoning)
    alert_msg = None
    alert_type = None

    with onto:
        # Ενημέρωση Data Properties
        syntagma.hasLoad = float(l_syn)
        syntagma.hasAmbientTemp = float(temp)
        gen.hasFuelLevel = float(row['gen_fuel'])

        # Logical Assertions
        if l_syn > 95 and temp < 0:
            if FailedNode not in syntagma.is_a: syntagma.is_a.append(FailedNode)
        else:
            if FailedNode in syntagma.is_a: syntagma.is_a.remove(FailedNode)

        if row['gen_fuel'] < 20:
            if LowFuelGenerator not in gen.is_a: gen.is_a.append(LowFuelGenerator)

        # Reasoning
        try:
            sync_reasoner(infer_property_values=True)
            if TotalBlackout in evangelismos.is_a:
                alert_type, alert_msg = "CRITICAL", "LOGIC ALERT: Hospital Blackout!"
        except Exception as e: print(f"Reasoner error: {e}")

    # 3. EMIT DATA
    payload = {
        'timestamp': str(row['timestamp']),
        'metrics': [{'id': 'sub-syntagma', 'val': temp, 'type': 'Temp'}, 
                    {'id': 'gen-evangelismos', 'val': row['gen_fuel'], 'type': 'Fuel'}],
        'prediction': {'risk_percent': round(risk_prob*100, 1)},
        'alert': {'type': alert_type, 'msg': alert_msg} if alert_type else None
    }
    await sio.emit('simulation_step', payload)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5050)