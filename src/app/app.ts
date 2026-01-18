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
  // 1. Metrics: Θερμοκρασίες, Φορτία (Από το 'metrics' του Python πακέτου)
  networkStatus: any[] = [
    { id: 'sub-syntagma', val: 0, type: 'temp' },
    { id: 'sub-omonia', val: 0, type: 'load' },
    { id: 'gen-evangelismos', val: 100, type: 'fuel' }
  ];

  // 2. ML Prediction: Η μεταβλητή που έλειπε!
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

    // A. Ακρόαση Ροής Δεδομένων (Αντικαθιστά το getSimulation)
    this.simService.getUpdates().subscribe({
      next: (fullPayload: any) => {
        // fullPayload = { timestamp, metrics, prediction, alert }
        
        // 1. Ενημέρωση Αισθητήρων
        this.networkStatus = fullPayload.metrics; 
        
        // 2. Ενημέρωση ML (Machine Learning)
        if (fullPayload.prediction) {
          this.predictionRisk = fullPayload.prediction.risk_percent;
          this.predictionMsg = fullPayload.prediction.msg;
        }

        // 3. Ενημέρωση Timestamp
        this.lastTimestamp = fullPayload.timestamp;

        // 4. Ενημέρωση Alert (Αν υπάρχει στο πακέτο)
        if (fullPayload.alert) {
          this.activeAlert = fullPayload.alert;
        } else {
          // Αν το πακέτο δεν έχει alert, καθαρίζουμε ΜΟΝΟ αν δεν είναι 'WARNING' που θέλουμε να μείνει λίγο
          // Για απλότητα: Αν η Python δεν στείλει alert, καθαρίζουμε.
          this.activeAlert = null;
        }

        this.cdr.detectChanges(); // Force Update
      },
      error: (err) => console.error('❌ Stream Error:', err)
    });

    // B. Ακρόαση Τοπολογίας (Προαιρετικό για τώρα, το βάζουμε για να μην χτυπάει)
    this.simService.getTopology().subscribe((nodes) => {
      console.log("🗺️ New Map Topology received:", nodes);
      // Εδώ μελλοντικά θα ενημερώνεις τον χάρτη
    });
  }

  // Helper για το HTML
  getValue(nodeId: string): number {
    const node = this.networkStatus.find(n => n.id === nodeId);
    // Αν είναι θερμοκρασία, επιστρέφουμε όπως είναι (μπορεί να είναι αρνητική)
    // Αν είναι load/fuel, επιστρέφουμε 0-100
    return node ? Number(node.val) : 0;
  }
}