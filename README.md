# ⚡ Neuro-Symbolic Resilience Engine (v2.5)

> **Research Project**: A Hybrid AI Digital Twin for monitoring Critical Infrastructure during extreme weather events. This platform combines **Random Forest Machine Learning** for predictive analysis and **OWL/SWRL Ontological Reasoning** for semantic impact assessment.

![Status](https://img.shields.io/badge/Status-Operational-success)
![UI](https://img.shields.io/badge/UI-Cyberpunk_Dark_Mode-orange)
![AI](https://img.shields.io/badge/AI-Random_Forest_Predictor-blueviolet)

---

## 📖 Overview
The project simulates the **Athens Power Grid** during the "Elpida" blizzard (January 2022). It models how extreme cold leads to infrastructure failure due to heating demand. The engine doesn't just monitor thresholds; it understands the connectivity between nodes (Substations, Hospitals, Generators) to infer systemic risks.

---

## 🚀 Key Features

- **Cyber-Physical Map**: A dark-mode Leaflet map with **Glowing LED Markers**. Markers pulse or flash based on real-time load/status.
- **High-Fidelity Simulation**: Data is not random; it follows a 24-hour historical replay of the 2022 blizzard with realistic residential and commercial load profiles.
- **Predictive AI**: Integrated Random Forest model that calculates "Grid Stress Probability" in real-time.
- **Live-Sync Telemetry**: Marker popups update their internal metrics (Temp, Load, Fuel) dynamically via WebSockets.

---

## ⚙️ Detailed Setup & Implementation

### 1. Backend Requirements (The Semantic Brain)
The backend requires a hybrid environment of **Python** and **Java** (for the HermiT Reasoner).

#### **Prerequisites**
* **Python 3.9+**
* **Java Runtime Environment (JRE) or JDK**: Essential for the OWL reasoning engine.
* **Java Path Configuration**: 
    1. Locate your `java.exe` (usually in `C:\Program Files\Java\...` or `C:\Program Files\Microsoft\...`).
    2. Open `server.py` and update the `java_path` variable:
       ```python
       java_path = r"C:\Your\Path\To\java.exe"
       ```

#### **Backend Installation**
Navigate to the `/backend` folder and install the dependencies:
```bash
pip install -r requirements.txt
```

#### **Initialization (One-time Setup)**
You must run these scripts in order to prepare the environment:
1.  **Generate Dataset**: `python generate_realism.py` (Creates `scenario_realism.csv`).
2.  **Train AI Model**: `python train_advanced_ml.py` (Creates `advanced_brain.pkl`).
3.  **Build Ontology**: `python create_ontology.py` (Creates `resilience.owl`).

---

### 2. Frontend Requirements (The Visualization Deck)
The frontend is built with **Angular 19+** and **Leaflet**.

#### **Installation**
Navigate to the root project folder:
```bash
npm install --legacy-peer-deps
```

#### **Configuration (Marker Assets)**
To fix "broken" map icons, ensure your `angular.json` includes the Leaflet asset copy command:
```json
"assets": [
  "src/assets",
  {
    "glob": "**/*",
    "input": "./node_modules/leaflet/dist/images",
    "output": "assets/"
  }
]
```

---

## ▶️ Execution

1.  **Start Backend**: 
    ```bash
    cd backend
    python server.py
    ```
    *Ensure the terminal says: `✅ Loading Digital Twin Models...`*

2.  **Start Frontend**:
    ```bash
    ng serve
    ```
    *Open [http://localhost:4200](http://localhost:4200) in your browser.*

---

## 🧪 Simulation Timeline
- **00:00 - 08:00**: Stable operation. Ambient Temp ~2°C.
- **09:00 - 17:00**: Load increases in Commercial zones (Gazi, Omonia).
- **18:00 - 22:00**: **Crisis Window**. Temp drops below 0°C. Residential load spikes. AI Predictor signals high risk (>80%). Primary substations may enter "Critical" flashing state.

---

## 🛠️ Tech Stack
- **AI/ML**: Scikit-Learn (Random Forest), Pandas, Joblib.
- **Reasoning**: Owlready2 (Python-OWL bridge), HermiT Reasoner.
- **Communication**: Socket.IO (Real-time Bi-directional).
- **Frontend**: Angular, Leaflet.js, RxJS.

---

## 📜 License
Advanced Research Project - All Rights Reserved.