# ⚡ Neuro-Symbolic Resilience Engine (v2.5)

> **Research Project**: A Hybrid AI Digital Twin for monitoring Critical Infrastructure during extreme weather events.

![Status](https://img.shields.io/badge/Status-Operational-success)
![UI](https://img.shields.io/badge/UI-Cyberpunk_Dark_Mode-orange)
![AI](https://img.shields.io/badge/AI-Random_Forest_Predictor-blueviolet)

## 📖 Overview
This system implements a **Neuro-Symbolic architecture** designed to monitor the Athens Power Grid. It specifically simulates the "Elpida" blizzard scenario (January 2022), where extreme cold led to record-breaking electrical loads and localized infrastructure failures.

The project fuses **Random Forest Machine Learning** (for risk prediction) with **OWL/SWRL Ontological Reasoning** (for semantic impact analysis).

---

## 🚀 Key Features

### 1. Cyber-Physical Visualization
- **Dark Matter Mapping:** A specialized geospatial view using CartoDB Dark Matter tiles for high-contrast monitoring.
- **Glowing LED Markers:** Markers are no longer static icons but CSS-animated "LED dots" that reflect node health:
  - 🟢 **Stable**: Green glow.
  - 🟠 **Warning**: Pulsing orange (Load > 75%).
  - 🔴 **Critical**: Rapid flashing red (Load > 90% or Failure).
- **Live-Sync Popups:** Marker popups update their internal telemetry (Load, Temp, Fuel) in real-time without needing to be closed and reopened.

### 2. Digital Twin Reliability
- **Realistic Load Profiling:** Modeled consumption patterns for Residential (Pagrati), Commercial (Gazi), and HV Hubs (Syntagma).
- **Historical Replay:** The simulation follows the actual 24-hour timeline of the 2022 blizzard, showing how temperature drops correlate with grid stress.

### 3. Neuro-Symbolic Logic
- **The Neuro Layer:** Predicts the probability of a "Grid Stress Event" based on ambient temperature and primary substation load.
- **The Symbolic Layer:** Uses the **HermiT Reasoner** to infer complex states like `TotalBlackout` by analyzing the relationship between substations, hospitals, and backup generators.

---

## 🛠️ Architecture & Stack
| Layer | Technology |
|---|---|
| **Frontend** | Angular 19+, Leaflet.js, CSS3 Animations |
| **Backend** | Python FastAPI, Socket.IO |
| **AI/ML** | Scikit-Learn (Random Forest), Pandas |
| **Reasoning** | Owlready2, HermiT DL Reasoner |

---

## ⚙️ Setup Instructions

### 1. Backend Preparation
Generate the synthetic historical data and train the AI models:
```bash
cd backend
pip install -r requirements.txt
python generate_realism.py   # Creates scenario_realism.csv
python train_advanced_ml.py  # Creates advanced_brain.pkl
python create_ontology.py    # Creates resilience.owl
```

### 2. Running the Simulation
**Start Backend:**
```bash
python server.py
```

**Start Frontend:**
```bash
npm install --legacy-peer-deps
ng serve
```

---

## 🧪 Simulation Timeline
- **Morning (00:00 - 08:00):** Stable operations, low residential load.
- **Mid-Day (09:00 - 16:00):** Increasing commercial load in Gazi/Omonia.
- **Evening (17:00 - 23:00):** **Crisis Phase.** Ambient temperature drops below 0°C. Heating demand spikes. The AI Predictor signals high risk, and the Reasoner identifies localized blackouts as primary nodes exceed 95% capacity.