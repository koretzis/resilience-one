from owlready2 import *

def create_resilience_ontology():
    # 1. Δημιουργία νέας Οντολογίας
    onto = get_ontology("http://test.org/resilience.owl")

    with onto:
        # --- ΚΛΑΣΕΙΣ (Concepts) ---
        class InfrastructureNode(Thing): pass
        class PowerSubstation(InfrastructureNode): pass
        class CriticalAsset(InfrastructureNode): pass
        class BackupGenerator(InfrastructureNode): pass

        # Καταστάσεις (States) - Αυτές θα χρησιμοποιήσει ο Reasoner
        class FailedNode(InfrastructureNode): pass
        class OverloadedNode(InfrastructureNode): pass
        class LowFuelGenerator(InfrastructureNode): pass
        class TotalBlackout(InfrastructureNode): pass
        class GridUnstable(InfrastructureNode): pass

        # --- PROPERTIES (Triplets / Relationships) ---
        class supplies(ObjectProperty):
            domain = [PowerSubstation]
            range = [CriticalAsset]

        class has_backup(ObjectProperty):
            domain = [CriticalAsset]
            range = [BackupGenerator]

        # Data Properties (Attributes)
        class hasLoad(DataProperty, FunctionalProperty):
            domain = [PowerSubstation]
            range = [float]

        class hasAmbientTemp(DataProperty, FunctionalProperty):
            domain = [PowerSubstation]
            range = [float]

        class hasFuelLevel(DataProperty, FunctionalProperty):
            domain = [BackupGenerator]
            range = [float]

        # --- INSTANCES (Individuals) ---
        # IDs που ταιριάζουν ακριβώς με τον server.py
        syntagma = PowerSubstation("sub-syntagma")
        omonia = PowerSubstation("sub-omonia")
        evangelismos = CriticalAsset("hosp-evangelismos")
        gen = BackupGenerator("gen-evangelismos")

        # Αρχικά Triplets (Συνδέσεις)
        syntagma.supplies.append(evangelismos)
        evangelismos.has_backup.append(gen)

        # --- SWRL RULES (The Logic) ---
        # Κανόνας 1: Αν ένας σταθμός που τροφοδοτεί ένα asset αποτύχει (FailedNode) 
        # ΚΑΙ η γεννήτρια έχει χαμηλό καύσιμο, τότε έχουμε TotalBlackout.
        rule1 = Imp()
        rule1.set_as_rule("""
            PowerSubstation(?s) ^ supplies(?s, ?a) ^ FailedNode(?s) ^ 
            CriticalAsset(?a) ^ has_backup(?a, ?g) ^ LowFuelGenerator(?g) 
            -> TotalBlackout(?a)
        """)

        # Κανόνας 2: Αν ο σταθμός είναι Overloaded, το δίκτυο είναι ασταθές
        rule2 = Imp()
        rule2.set_as_rule("""
            PowerSubstation(?s) ^ OverloadedNode(?s) ^ supplies(?s, ?a) 
            -> GridUnstable(?a)
        """)

    # Αποθήκευση στο αρχείο
    onto.save(file="resilience.owl", format="rdfxml")
    print("✅ Ontology 'resilience.owl' created successfully with Triplets and Rules!")

if __name__ == "__main__":
    create_resilience_ontology()