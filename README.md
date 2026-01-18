# Resilience-One: Neuro-Symbolic Crisis Management Twin

## Project Overview
A real-time Digital Twin for Critical Infrastructure Protection (CIP). This project demonstrates a **Neuro-Symbolic AI approach** by combining sub-symbolic sensor data processing (Neural) with ontology-based reasoning (Symbolic) to predict cascading failures in power grids.

## Technical Architecture (Senior Hybrid Profile)
* **Frontend:** Angular 17+ (Strict Mode)
* **State Management:** NgRx (Redux Pattern) for handling high-frequency IoT streams.
* **Visualization:** 
    * **Geospatial:** Leaflet.js for situational awareness.
    * **Graph:** D3.js Force-Directed Graph for dependency analysis.
* **Data Model:** JSON-LD (Linked Data) ensuring semantic interoperability.

## Key Features
1.  **Real-Time Anomaly Detection:** Simulates IoT sensor streams using RxJS multicasting.
2.  **Semantic Reasoning Engine:** automatically infers downstream risks (e.g., "Hospital Power Loss") based on upstream failures, bridging the gap between raw data and decision support.
3.  **Cross-Domain Knowledge:** Visualizes the "supplies" relationships between Energy and Health domains.

## Testing
* Business logic verified with **Jest** unit tests covering the inference engine.