from owlready2 import *
import os

# 1. SETUP JAVA
java_path = r"C:\Program Files\Microsoft\jdk-25.0.1.8-hotspot\bin\java.exe"
if os.path.exists(java_path):
    owlready2.JAVA_EXE = java_path
    print(f"✅ JAVA PATH OK")

# 2. SETUP ONTOLOGY
onto = get_ontology("http://test.org/crisis.owl")

with onto:
    class InfrastructureNode(Thing): pass
    class PowerSubstation(InfrastructureNode): pass
    class CriticalAsset(InfrastructureNode): pass
    
    # ΔΥΟ ΤΑΜΠΕΛΕΣ
    class OverheatingNode(InfrastructureNode): pass  # Αιτία
    class AtRiskAsset(InfrastructureNode): pass      # Αποτέλεσμα

    class supplies(ObjectProperty):
        domain = [PowerSubstation]; range = [CriticalAsset]

    # SWRL RULE: Class based (Πιο δυνατό)
    # Αν το ?p είναι OverheatingNode και δίνει στο ?a -> Τότε το ?a είναι AtRiskAsset
    rule = Imp()
    rule.set_as_rule("""
        OverheatingNode(?p), supplies(?p, ?a) -> AtRiskAsset(?a)
    """)

# 3. SETUP DATA
with onto:
    syntagma = PowerSubstation("sub-syntagma")
    evangelismos = CriticalAsset("hosp-evangelismos")
    syntagma.supplies.append(evangelismos)

# 4. SIMULATION
print("\n🔥 Simulating 95°C Temperature...")
syntagma.is_a.append(OverheatingNode) # Βάζουμε την ετικέτα φωτιάς

print("🧠 Running Reasoner...")
with onto:
    # Ζητάμε να μάθουμε τις σχέσεις (ObjectProperties) και τους Τύπους (Classes)
    sync_reasoner(infer_property_values=True)

# 5. CHECK RESULT
print("\n🔍 Checking Results...")

# Ελέγχουμε αν το νοσοκομείο πήρε την ετικέτα 'AtRiskAsset'
# Προσοχή: Το evangelismos.is_a επιστρέφει λίστα κλάσεων
is_at_risk = False
for cls in evangelismos.is_a:
    if cls == AtRiskAsset:
        is_at_risk = True

if is_at_risk:
    print("🦉 SUCCESS! The Owl logic worked!")
    print("   Evangelismos is now classified as: [AtRiskAsset]")
else:
    print("⚠️ FAILURE. Still nothing.")
    print(f"Evangelismos classes: {evangelismos.is_a}")