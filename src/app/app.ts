import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulationService } from './services/simulation';
import { GeoMapComponent } from './components/geo-map/geo-map';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GeoMapComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  // 1. Metrics: Temperatures, Loads (From Python package 'metrics')
  networkStatus: any[] = [
    { id: 'sub-syntagma', val: 0, type: 'temp' },
    { id: 'sub-omonia', val: 0, type: 'load' },
    { id: 'gen-evangelismos', val: 100, type: 'fuel' }
  ];

  // 2. ML Prediction: The missing variable!
  predictionRisk: number = 0; 
  predictionMsg: string = 'Initializing AI...';
  
  // 3. Metadata
  lastTimestamp: string = '-';
  activeAlert: { type: string, msg: string } | null = null;

  constructor(
    private simService: SimulationService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    console.log("🚀 App Started. Connecting to Neuro-Symbolic Engine...");

    // A. Listen to Data Stream (Replaces getSimulation)
    this.simService.getUpdates().subscribe({
      next: (fullPayload: any) => {
        // fullPayload = { timestamp, metrics, prediction, alert }
        
        // 1. Update Sensors
        this.networkStatus = fullPayload.metrics; 
        
        // 2. Update ML (Machine Learning)
        if (fullPayload.prediction) {
          this.predictionRisk = fullPayload.prediction.risk_percent;
          this.predictionMsg = fullPayload.prediction.msg;
        }

        // 3. Update Timestamp
        this.lastTimestamp = fullPayload.timestamp;

        // 4. Update Alert (If present in the packet)
        if (fullPayload.alert) {
          this.activeAlert = fullPayload.alert;
        } else {
          // If the packet has no alert, clear ONLY if it's not 'WARNING' which we want to persist a bit
          // For simplicity: If Python doesn't send an alert, clear it.
          this.activeAlert = null;
        }

        this.cdr.detectChanges(); // Force Update
      },
      error: (err) => console.error('❌ Stream Error:', err)
    });

    // B. Listen to Topology (Optional for now, added to avoid errors)
    this.simService.getTopology().subscribe((nodes) => {
      console.log("🗺️ New Map Topology received:", nodes);
      // Here you will update the map in the future
    });
  }

  // Helper for HTML
  getValue(nodeId: string): number {
    const node = this.networkStatus.find(n => n.id === nodeId);
    // If it is temperature, return as is (can be negative)
    // If it is load/fuel, return 0-100
    return node ? Number(node.val) : 0;
  }
}