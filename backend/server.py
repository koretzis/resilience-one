import uvicorn
from fastapi import FastAPI
import socketio
from owlready2 import *
import os
import time

# --- 1. JAVA CONFIG ---
java_path = r"C:\Program Files\Microsoft\jdk-25.0.1.8-hotspot\bin\java.exe"
if os.path.exists(java_path): owlready2.JAVA_EXE = java_path

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
app.mount('/', socketio.ASGIApp(sio, app))

# --- 2. ONTOLOGY SETUP ---
print("📚 Building Resilience Ontology...")
onto = get_ontology("http://test.org/resilience.owl")

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

    rule1 = Imp() 
    rule1.set_as_rule("supplies(?p1, ?a), is_redundant_to(?p2, ?p1), FailedNode(?p1), OverloadedNode(?p2) -> GridUnstable(?a)")
    rule2 = Imp() 
    rule2.set_as_rule("GridUnstable(?a), has_backup(?a, ?g), LowFuelGenerator(?g) -> TotalBlackout(?a)")

with onto:
    syntagma = PowerSubstation("sub-syntagma")
    omonia = PowerSubstation("sub-omonia")
    evangelismos = CriticalAsset("hosp-evangelismos")
    gen_evangelismos = BackupGenerator("gen-evangelismos")
    syntagma.supplies.append(evangelismos)
    omonia.is_redundant_to.append(syntagma)
    evangelismos.has_backup.append(gen_evangelismos)

# --- GLOBAL STATE ---
last_sent_alert = ""
active_sid = None  # <--- ID ΤΟΥ ΜΟΝΑΔΙΚΟΥ ΕΝΕΡΓΟΥ ΧΡΗΣΤΗ

def hard_reset_ontology():
    global last_sent_alert
    print("🔄 ZOMBIE KILLER: WIPING MEMORY...")
    syntagma.is_a = [PowerSubstation]
    omonia.is_a = [PowerSubstation]
    gen_evangelismos.is_a = [BackupGenerator]
    evangelismos.is_a = [CriticalAsset]
    last_sent_alert = "" 
    try:
        with onto: sync_reasoner(infer_property_values=True)
    except: pass
    print("✨ System Clean.")

@sio.event
async def connect(sid, environ):
    global active_sid
    print(f"👋 New Captain Detected: {sid}")
    
    # Ορίζουμε ότι ΑΥΤΟΣ είναι ο μόνος που έχει δικαίωμα να μιλάει
    active_sid = sid
    
    hard_reset_ontology()

@sio.event
async def sensor_update(sid, data):
    global last_sent_alert, active_sid
    
    # --- ZOMBIE CHECK ---
    # Αν το ID αυτού που στέλνει δεν είναι το ID του τελευταίου που συνδέθηκε...
    if sid != active_sid:
        # ...τότε είναι Zombie! Τον αγνοούμε πλήρως.
        # print(f"🧟 Ignoring Zombie Packet from {sid}")
        return 

    updates = data if isinstance(data, list) else [data]
    current_fuel = 100 
    inference_needed = False

    # Cleanup
    if GridUnstable in evangelismos.is_a: evangelismos.is_a.remove(GridUnstable)
    if TotalBlackout in evangelismos.is_a: evangelismos.is_a.remove(TotalBlackout)

    for r in updates:
        nid, val = r.get('id'), r.get('val')

        if nid == 'sub-syntagma':
            if val > 90 and FailedNode not in syntagma.is_a:
                syntagma.is_a.append(FailedNode); inference_needed = True
            elif val <= 90 and FailedNode in syntagma.is_a:
                syntagma.is_a.remove(FailedNode)

        elif nid == 'sub-omonia':
            if val > 90 and OverloadedNode not in omonia.is_a:
                omonia.is_a.append(OverloadedNode); inference_needed = True
            elif val <= 90 and OverloadedNode in omonia.is_a:
                omonia.is_a.remove(OverloadedNode)

        elif nid == 'gen-evangelismos':
            current_fuel = val
            if val < 20 and LowFuelGenerator not in gen_evangelismos.is_a:
                gen_evangelismos.is_a.append(LowFuelGenerator); inference_needed = True
            elif val >= 20 and LowFuelGenerator in gen_evangelismos.is_a:
                gen_evangelismos.is_a.remove(LowFuelGenerator)

    if inference_needed:
        try:
            with onto: sync_reasoner(infer_property_values=True)
            
            final_status = "OK"
            if TotalBlackout in evangelismos.is_a: final_status = "CRITICAL"
            elif GridUnstable in evangelismos.is_a: final_status = "WARNING"
            
            # STRICT SAFETY CHECK
            if final_status == "CRITICAL" and current_fuel > 20:
                print("⚠️ Safety Override: Fuel is OK.")
                final_status = "WARNING"

            # ALERT DISPATCH
            if final_status == "CRITICAL" and last_sent_alert != "CRITICAL":
                msg = "TOTAL BLACKOUT! Generator Dead."
                print(f"🦉 CRITICAL: {msg}")
                await sio.emit('inference_alert', {'type': 'CRITICAL', 'msg': msg})
                last_sent_alert = "CRITICAL"

            elif final_status == "WARNING" and last_sent_alert != "WARNING":
                msg = "Grid Lost. Running on Backup."
                print(f"🦉 WARNING: {msg}")
                await sio.emit('inference_alert', {'type': 'WARNING', 'msg': msg})
                last_sent_alert = "WARNING"
                
        except Exception as e: print(f"❌ Error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5050)