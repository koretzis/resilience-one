import pandas as pd
import numpy as np

# --- ΡΥΘΜΙΣΕΙΣ ---
MINUTES = 1440 # 24 ώρες
time_index = pd.date_range("2022-01-24 00:00", periods=MINUTES, freq="T")

# --- 1. ΚΑΙΡΙΚΟ ΜΟΝΤΕΛΟ (Η "ΕΛΠΙΔΑ") ---
# Ξεκινάμε με κρύο (2C) και πέφτουμε σε παγωνιά (-2C) το βράδυ
def get_temp_curve():
    t = np.linspace(0, 1, MINUTES)
    base = 2 - (4 * t) # Linear drop from 2 to -2
    noise = np.random.normal(0, 0.2, MINUTES)
    return base + noise

temp_curve = get_temp_curve()

# --- 2. ΠΡΟΦΙΛ ΚΑΤΑΝΑΛΩΣΗΣ (LOAD PROFILES) ---

# Α. Οικιστικό (Παγκράτι, Κυψέλη): Αιχμή το πρωί (7-9) και μεγάλη αιχμή το βράδυ (18-22)
def residential_profile():
    x = np.linspace(0, 24, MINUTES)
    # Δύο καμπύλες Gauss: Μία μικρή πρωί, μία μεγάλη βράδυ
    morning = 20 * np.exp(-(x - 8)**2 / 2) 
    evening = 50 * np.exp(-(x - 20)**2 / 4)
    base = 30
    return base + morning + evening

# Β. Εμπορικό (Γκάζι, Ομόνοια): Αιχμή 09:00 - 17:00
def commercial_profile():
    x = np.linspace(0, 24, MINUTES)
    # Μία μεγάλη "πλατιά" καμπύλη τη μέρα
    daytime = 60 * np.exp(-(x - 14)**2 / 20)
    base = 20
    return base + daytime

# --- 3. ΣΥΝΘΕΣΗ ΜΕ ΘΕΡΜΟΚΡΑΣΙΑ ---
# Όσο πέφτει η θερμοκρασία κάτω από τους 15C, η ζήτηση αυξάνεται για θέρμανση
def apply_weather_impact(load_profile, temps):
    heating_factor = np.maximum(0, (15 - temps) * 2.5) # +2.5% load per degree drop
    return load_profile + heating_factor + np.random.normal(0, 1, MINUTES)

# --- ΔΗΜΙΟΥΡΓΙΑ ΔΕΔΟΜΕΝΩΝ ---

# Substations (Children)
load_pagrati = apply_weather_impact(residential_profile(), temp_curve) # Οικιστικό
load_gazi = apply_weather_impact(commercial_profile(), temp_curve)     # Εμπορικό
load_omonia = apply_weather_impact(commercial_profile(), temp_curve)   # Εμπορικό (Backup Node)

# HV Substations (Parents - Aggregators)
# Το Σύνταγμα ταΐζει Παγκράτι + Νοσοκομείο + Κέντρο. Άρα έχει τεράστιο φορτίο.
# Αντέχει μέχρι 150MW (scale down to 0-100% for UI)
raw_syntagma = (load_pagrati + load_omonia) / 1.8 
load_syntagma = np.clip(raw_syntagma, 0, 100)

# Kypseli (Other HV node)
raw_kypseli = (load_pagrati * 0.8 + load_gazi) / 1.5
load_kypseli = np.clip(raw_kypseli, 0, 100)

# Generator Fuel (Linear drain starting at 18:00 when grid fails)
fuel = np.ones(MINUTES) * 100
fail_start = 18 * 60 # 18:00
for i in range(fail_start, MINUTES):
    fuel[i] = max(0, 100 - (0.3 * (i - fail_start))) # Drains fast

# --- RISK LABELING (Για το ML) ---
# Αν το Σύνταγμα ζορίζεται (>90) ΚΑΙ κάνει κρύο (<0), έχουμε ρίσκο.
risks = []
for t, l in zip(temp_curve, load_syntagma):
    if l > 88 and t < 1:
        risks.append(1)
    else:
        risks.append(0)

# --- SAVE ---
df = pd.DataFrame({
    'timestamp': time_index,
    'temp_ambient': temp_curve,
    'load_syntagma': load_syntagma, # HV
    'load_kypseli': load_kypseli,   # HV
    'load_omonia': load_omonia,     # MV
    'load_pagrati': load_pagrati,   # MV
    'load_gazi': load_gazi,         # MV
    'gen_fuel': fuel,
    'risk_label': risks
})

df.to_csv("scenario_realism.csv", index=False)
print("✅ Advanced Digital Twin Data Generated: 'scenario_realism.csv'")