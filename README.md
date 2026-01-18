# Resilience-One: Neuro-Symbolic Crisis Management Twin

![Angular](https://img.shields.io/badge/Angular-17+-dd0031.svg?style=flat&logo=angular)
![RxJS](https://img.shields.io/badge/RxJS-Reactive-B7178C.svg?style=flat&logo=reactivex)
![D3.js](https://img.shields.io/badge/D3.js-Data_Viz-F9A03C.svg?style=flat&logo=d3.js)
![Status](https://img.shields.io/badge/Status-Prototype-success)

## 📌 Project Overview

**Resilience-One** is a real-time Digital Twin prototype designed for **Critical Infrastructure Protection (CIP)**. 

It demonstrates a **Neuro-Symbolic AI approach** to crisis management by bridging the gap between sub-symbolic sensor data (Neural/Statistical) and ontology-based knowledge representation (Symbolic). The system simulates an industrial IoT network (Energy Grid & Health dependencies) to predict and visualize cascading failures before they impact critical assets.

This project was developed to demonstrate competencies in **Frontend Engineering (Angular/D3)**, **Real-Time Data Streams**, and **Semantic Knowledge Engineering**.

---

## 🚀 Key Features

### 1. Neuro-Symbolic Inference Engine
* **The "Neuro" Component:** Ingests high-frequency simulated IoT sensor streams (Temperature, Load, Status) using **RxJS** stochastic generators.
* **The "Symbolic" Component:** Utilizes a **Knowledge Graph** structure (based on JSON-LD) to map interdependencies between Power Substations and Critical Assets (Hospitals, Emergency Services).
* **Reasoning:** An embedded inference engine detects anomalies in the sensor stream and automatically queries the graph to flag downstream risks (e.g., *"Hospital A is at risk due to failure in Substation B"*).

### 2. Dual-View Situational Awareness
* **Geospatial Twin (Left Panel):** A **Leaflet.js** map providing location-based situational awareness of infrastructure nodes in Athens, Greece.
* **Semantic Graph (Right Panel):** A **D3.js Force-Directed Graph** visualizing the topological dependencies and "supplies" relationships, enabling visual exploration of the crisis propagation path.

### 3. Enterprise-Grade Architecture
* **State Management:** Implemented with **NgRx** (Redux pattern) to ensure predictable state transitions and immutable data handling for the inference logic.
* **Performance:** Optimized rendering using `OnPush` change detection and RxJS `share()` operators to multicast simulation streams, preventing race conditions and redundant computations.

---

## 🛠️ Tech Stack

* **Framework:** Angular 17+ (Strict Mode enabled)
* **State Management:** NgRx (Store, Selectors, Actions)
* **Visualization:** D3.js (v7), Leaflet
* **Reactive Programming:** RxJS (Observables, Operators)
* **Data Format:** JSON-LD (Linked Data) for Semantic Interoperability
* **Testing:** Jest (Unit Testing for Logic)

---

## 🔬 Scientific & Design Decisions (Architecture Notes)

### Why Client-Side Reasoning?
For this prototype, the **Inference Engine** is implemented as a rule-based logic layer within the NgRx Selectors.
* **Trade-off:** While a full Semantic Web stack would utilize an OWL Reasoner (like HermiT or Pellet) on the backend, this client-side implementation demonstrates the *logic* of cascading failure prediction with zero latency.
* **Semantic Alignment:** The data model strictly follows **JSON-LD** standards, ensuring that the underlying graph can be easily exported to RDF triples for integration with formal ontologies (e.g., SAREF4ENER).

### Scalability Considerations
The current visualization renders nodes using SVG (D3) and DOM elements (Leaflet).
* **Current Capacity:** Optimal for <500 nodes (City-scale district).
* **Future Scaling:** For nation-scale digital twins (>10,000 nodes), the rendering layer would be migrated to **WebGL (Three.js or Deck.gl)**, and the simulation logic would be offloaded to **Web Workers** to keep the main thread unblocked.

---

## 🚦 Getting Started

### Prerequisites
* Node.js (v18+)
* Angular CLI

### Installation
```bash
# Clone the repository
git clone [https://github.com/YOUR_USERNAME/resilience-one.git](https://github.com/YOUR_USERNAME/resilience-one.git)

# Navigate to directory
cd resilience-one

# Install dependencies
npm install