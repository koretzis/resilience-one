import pandas as pd
import numpy as np
import random

# Προσομοίωση 24 ωρών (1 εγγραφή ανά λεπτό = 1440 γραμμές)
# Σενάριο "Ελπίδα": Κρύο, Θέρμανση στο τέρμα, κατάρρευση το βράδυ.

minutes = 1440
timestamps = pd.date_range("2022-01-24 00:00", periods=minutes, freq="T")

# 1. Θερμοκρασία (Πολύ κρύο, πέφτει το βράδυ)
temps = []
for i in range(minutes):
    # Η θερμοκρασία πέφτει από τους 2C στους -1C
    base_temp = 2 - (3 * (i / minutes)) 
    noise = np.random.normal(0, 0.5)
    temps.append(base_temp + noise)

# 2. Φορτίο (Load): Ανεβαίνει όσο πέφτει η θερμοκρασία
loads = []
for i in range(minutes):
    # Βασικό φορτίο 60%, ανεβαίνει στο 95% το βράδυ
    base_load = 60 + (35 * (i / minutes))
    noise = np.random.normal(0, 2)
    loads.append(base_load + noise)

# 3. Target (Failure): Αν Load > 90 ΚΑΙ Temp < 0 -> Μεγάλη πιθανότητα βλάβης
failures = []
for t, l in zip(temps, loads):
    if l > 88 and t < 0.5:
        failures.append(1) # Κίνδυνος Βλάβης
    else:
        failures.append(0) # Όλα καλά

df = pd.DataFrame({
    'timestamp': timestamps,
    'temperature': temps,
    'grid_load': loads,
    'risk_label': failures
})

df.to_csv("elpida_scenario.csv", index=False)
print("✅ Dataset 'elpida_scenario.csv' generated!")