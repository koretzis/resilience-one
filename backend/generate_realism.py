import pandas as pd
import numpy as np

# --- SETTINGS ---
MINUTES = 1440 # 24 hours
time_index = pd.date_range("2022-01-24 00:00", periods=MINUTES, freq="T")

# --- 1. WEATHER MODEL ("ELPIDA") ---
# Start with cold (2C) and drop to freezing (-2C) at night
def get_temp_curve():
    t = np.linspace(0, 1, MINUTES)
    base = 2 - (4 * t) # Linear drop from 2 to -2
    noise = np.random.normal(0, 0.2, MINUTES)
    return base + noise

temp_curve = get_temp_curve()

# --- 2. LOAD PROFILES ---

# A. Residential (Pagrati, Kypseli): Peak in morning (7-9) and large peak in evening (18-22)
def residential_profile():
    x = np.linspace(0, 24, MINUTES)
    # Two Gaussian curves: One small morning, one large evening
    morning = 20 * np.exp(-(x - 8)**2 / 2) 
    evening = 50 * np.exp(-(x - 20)**2 / 4)
    base = 30
    return base + morning + evening

# B. Commercial (Gazi, Omonia): Peak 09:00 - 17:00
def commercial_profile():
    x = np.linspace(0, 24, MINUTES)
    # One large "wide" curve during the day
    daytime = 60 * np.exp(-(x - 14)**2 / 20)
    base = 20
    return base + daytime

# --- 3. COMPOSITION WITH TEMPERATURE ---
# As temperature drops below 15C, demand increases for heating
def apply_weather_impact(load_profile, temps):
    heating_factor = np.maximum(0, (15 - temps) * 2.5) # +2.5% load per degree drop
    return load_profile + heating_factor + np.random.normal(0, 1, MINUTES)

# --- DATA GENERATION ---

# Substations (Children)
load_pagrati = apply_weather_impact(residential_profile(), temp_curve) # Residential
load_gazi = apply_weather_impact(commercial_profile(), temp_curve)     # Commercial
load_omonia = apply_weather_impact(commercial_profile(), temp_curve)   # Commercial (Backup Node)

# HV Substations (Parents - Aggregators)
# Syntagma feeds Pagrati + Hospital + Center. So it has huge load.
# Withstands up to 150MW (scale down to 0-100% for UI)
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

# --- RISK LABELING (For ML) ---
# If Syntagma is stressed (>90) AND it is cold (<0), we have risk.
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