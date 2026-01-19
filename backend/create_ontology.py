from owlready2 import *
import os

# --- JAVA PATH (Ίδιο με τον server) ---
java_path = r"C:\Program Files\Microsoft\jdk-25.0.1.8-hotspot\bin\java.exe"
if os.path.exists(java_path): owlready2.JAVA_EXE = java_path

# Δημιουργία Οντολογίας
onto = get_ontology("http://test.org/resilience.owl")

print("🏗️  Defining Ontology Structure...")

with onto:
    # --- CLASSES ---
    class InfrastructureNode(Thing): pass
    class PowerSubstation(InfrastructureNode): pass
    class CriticalAsset(InfrastructureNode): pass
    class BackupGenerator(InfrastructureNode): pass

    # --- TAGS ---
    class FailedNode(InfrastructureNode): pass
    class OverloadedNode(InfrastructureNode): pass
    class LowFuelGenerator(InfrastructureNode): pass
    
    # --- STATES ---
    class GridUnstable(InfrastructureNode): pass
    class TotalBlackout(InfrastructureNode): pass

    # --- PROPERTIES ---
    class supplies(ObjectProperty): 
        domain = [PowerSubstation]; range = [CriticalAsset]
    class has_backup(ObjectProperty): 
        domain = [CriticalAsset]; range = [BackupGenerator]
    class is_redundant_to(ObjectProperty): 
        domain = [PowerSubstation]; range = [PowerSubstation]

    # --- RULES (SWRL) ---
    # Rule 1: Warning
    rule1 = Imp()
    rule1.set_as_rule("supplies(?p1, ?a), is_redundant_to(?p2, ?p1), FailedNode(?p1), OverloadedNode(?p2) -> GridUnstable(?a)")
    
    # Rule 2: Critical
    rule2 = Imp()
    rule2.set_as_rule("GridUnstable(?a), has_backup(?a, ?g), LowFuelGenerator(?g) -> TotalBlackout(?a)")

# --- SAVE TO FILE ---
outfile = "resilience.owl"
onto.save(file=outfile)
print(f"✅ Ontology saved successfully as '{outfile}'")