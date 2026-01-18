# ⚡ Neuro-Symbolic Resilience Engine

> **Research Project**: A Hybrid AI System for Detecting Cascading Failures in Critical Infrastructure.

![Status](https://img.shields.io/badge/Status-Stable-success)
![Stack](https://img.shields.io/badge/Tech-Angular%20%7C%20Python%20%7C%20OWL%2FSWRL-blue)

## 📖 Overview
This project implements a **Neuro-Symbolic AI architecture** that fuses real-time sensor data (Sub-symbolic/Neural layer) with ontological reasoning (Symbolic layer) to monitor power grid resilience.

Unlike traditional threshold-based systems, this engine understands **Semantic Context** (e.g., Redundancy, Dependency, Cascading Effects) to distinguish between local faults and systemic collapses.

## 🚀 Key Features

### 1. Neuro-Symbolic Reasoning
- **Data Layer (Python):** Processes raw telemetry (Temperature, Load, Fuel) and handles noise/safety overrides.
- **Logic Layer (Owlready2 + HermiT):** Uses SWRL rules to infer high-level states:
  - *Rule 1:* `Loss of Redundancy` → **WARNING** (Grid Unstable).
  - *Rule 2:* `Grid Lost + Empty Generator` → **CRITICAL** (Total Blackout).

### 2. Advanced State Management
- **Zombie Connection Killer:** Automatically detects and blocks stale packets from previous browser sessions to prevent race conditions (flickering alerts) during page refreshes.
- **Brain Wipe Mechanism:** The Ontology state acts as a singleton and performs a "Hard Reset" upon every new client connection, ensuring a clean simulation environment.
- **Strict Hierarchical Logic:** Implemented a safety gate where physical constraints (e.g., "Fuel > 20%") override semantic inferences to prevent false positives.

### 3. Real-Time Visualization
- **Angular Dashboard:** Live monitoring of Critical Assets.
- **Geospatial Map:** Leaflet.js integration for topological visualization.
- **Heads-Up Alerts:** Visual warning system for inferred risks.

---

## 🛠️ Architecture

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | Angular 17+ | Dashboard, Leaflet Map, RxJS Streams. |
| **Backend** | Python FastAPI | WebSocket Server, Data processing. |
| **Reasoning** | Owlready2 | Ontology management & SWRL execution. |
| **Protocol** | Socket.IO | Real-time bi-directional communication. |

---

## ⚙️ Installation & Setup

### Prerequisites
1. **Node.js** (v18+)
2. **Python** (3.9+)
3. **Java Runtime (JRE)** (Required for the HermiT Reasoner)

### 1. Backend Setup
Navigate to the `backend` folder:
```bash
cd backend
pip install -r requirements.txt
# Ensure 'resilience.owl' is in the same directory
```

### 2. Frontend Setup
Navigate to the root folder:
```bash
npm install
```

---

## ▶️ How to Run

### Step 1: Start the Semantic Engine (Backend)
```bash
# In the backend terminal
python server.py
```
*You should see: `✅ Server Ready. Waiting for Browser...`*

### Step 2: Start the Dashboard (Frontend)
```bash
# In the frontend terminal
ng serve
```
*Open your browser at `http://localhost:4200`*

---

## 🧪 Simulation Scenario (Timeline)

The system runs a **20-second cascading failure simulation** automatically upon connection.

| Time | Event | System Logic | Output |
|------|-------|--------------|--------|
| **0-5s** | Normal Ops | All nodes stable. | 🟢 **Safe** |
| **6s** | Syntagma Fails | Temp > 90°C. Redundancy (Omonia) handles load. | 🟢 **Safe** (Smart Reasoning) |
| **12s** | Omonia Overloads | Load > 90%. Redundancy Lost. | 🟠 **WARNING**: Grid Lost |
| **20s** | Generator Empty | Fuel < 20%. Last defense fails. | 🔴 **CRITICAL**: Total Blackout |

---

## 🐛 Troubleshooting

**Q: I see "CRITICAL ALERT" immediately upon refresh.**
*A: This was the "Zombie Connection" bug. It is fixed in the latest version. The server now enforces a strict session ID check and blocks old session packets.*

**Q: The map shows 0 values.**
*A: Wait 2-3 seconds. The simulation starts with a small delay to allow the Ontology to initialize and infer the initial state.*

**Q: Reasoner Error in Python Console.**
*A: Ensure Java is installed and added to your System PATH. Owlready2 needs Java to run the HermiT reasoner.*
