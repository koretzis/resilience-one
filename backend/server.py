import uvicorn
from fastapi import FastAPI
import socketio
from owlready2 import *
import owlready2
import os

# --- JAVA SETUP (ΚΡΑΤΑΜΕ ΤΟ ΣΩΣΤΟ) ---
java_path = r"C:\Program Files\Microsoft\jdk-25.0.1.8-hotspot\bin\java.exe"

if os.path.exists(java_path):
    owlready2.JAVA_EXE = java_path
    print(f"✅ Java configured: {java_path}")
else:
    print(f"⚠️ Warning: Check Java path.")

# --- NETWORK ---
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
app.mount('/', socketio.ASGIApp(sio, app))

# --- ONTOLOGY ---
print("📚 Loading Ontology...")
onto = get_ontology("http://test.org/crisis.owl")

with onto:
    class InfrastructureNode(Thing): pass
    class PowerSubstation(InfrastructureNode): pass
    class CriticalAsset(InfrastructureNode): pass
    
    # ΟΙ ΕΤΙΚΕΤΕΣ ΜΑΣ (Logic Tags)
    class OverheatingNode(InfrastructureNode): pass # Αιτία
    class AtRiskAsset(InfrastructureNode): pass      # Αποτέλεσμα

    class supplies(ObjectProperty):
        domain = [PowerSubstation]; range = [CriticalAsset]

    # SWRL RULE: Απλή και Σταθερή
    # Αν το ?p καίγεται και δίνει στο ?a -> Τότε το ?a είναι σε κίνδυνο
    rule = Imp()
    rule.set_as_rule("""
        OverheatingNode(?p), supplies(?p, ?a) -> AtRiskAsset(?a)
    """)

with onto:
    syntagma = PowerSubstation("sub-syntagma")
    evangelismos = CriticalAsset("hosp-evangelismos")
    syntagma.supplies.append(evangelismos)

print("✅ Ontology Ready.")

# --- MAIN LOOP ---
@sio.event
async def connect(sid, environ):
    print(f"✅ Client Connected: {sid}")

@sio.event
async def sensor_update(sid, data):
    if data.get('id') == 'sub-syntagma':
        temp = float(data.get('temp'))
        
        # 1. LOGIC: Αν καίγεται, βάλε την ετικέτα
        if temp > 85:
            # Βάζουμε την ταμπέλα "Overheating" στο Σύνταγμα
            if OverheatingNode not in syntagma.is_a:
                syntagma.is_a.append(OverheatingNode)
            
            # 2. REASONING: Τρέξε τον HermiT
            try:
                # Ζητάμε να κάνει inference στις ΚΛΑΣΕΙΣ (classes)
                with onto:
                    sync_reasoner(infer_property_values=True)
                
                # 3. CHECK RESULT: Έγινε το Ευαγγελισμός "AtRiskAsset";
                is_critical = False
                if AtRiskAsset in evangelismos.is_a:
                    is_critical = True
                
                if is_critical:
                    msg = "CRITICAL RISK - Hospital Power Supply Unstable!"
                    print(f"🦉 [INFERENCE SUCCESS] {msg}")
                    
                    # Στέλνουμε το Alert
                    await sio.emit('inference_alert', {'msg': msg})
                    
                    # Cleanup: Βγάζουμε την ετικέτα για να μην χτυπάει μόνιμα
                    if AtRiskAsset in evangelismos.is_a:
                        evangelismos.is_a.remove(AtRiskAsset)

            except Exception as e:
                print(f"❌ Reasoner Error: {e}")

        else:
            # Αν κρύωσε, βγάζουμε την ετικέτα Overheating
            if OverheatingNode in syntagma.is_a:
                syntagma.is_a.remove(OverheatingNode)

if __name__ == "__main__":
    print("🚀 System Online on port 5050...")
    uvicorn.run(app, host="127.0.0.1", port=5050)