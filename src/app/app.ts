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
  networkStatus: any[] = [
    { id: 'sub-syntagma', val: 45, type: 'temp' },
    { id: 'sub-omonia', val: 45, type: 'load' },
    { id: 'gen-evangelismos', val: 100, type: 'fuel' }
  ];

  // Μεταβλητές για το Popup Alert
  activeAlert: { type: string, msg: string } | null = null;

  constructor(
    private simService: SimulationService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    // 1. Ροή Δεδομένων
    this.simService.getSimulation().subscribe((data) => {
      this.networkStatus = data;
      this.cdr.detectChanges();
    });

    // 2. Ροή Alerts (ΝΕΟ)
    this.simService.getAlerts().subscribe((alertData) => {
      this.activeAlert = alertData; // Εμφάνισε το Alert
      this.cdr.detectChanges();

      // Αν είναι απλό Warning, κρύψε το μετά από 5 δευτερόλεπτα
      // Αν είναι CRITICAL, άστο να φαίνεται μόνιμα!
      if (alertData.type === 'WARNING') {
        setTimeout(() => {
          // Καθαρίζουμε το alert μόνο αν δεν έχει έρθει νεότερο critical εν τω μεταξύ
          if (this.activeAlert && this.activeAlert.type === 'WARNING') {
            this.activeAlert = null;
            this.cdr.detectChanges();
          }
        }, 8000);
      }
    });
  }

  getValue(nodeId: string): number {
    const node = this.networkStatus.find(n => n.id === nodeId);
    return node ? node.val : 0;
  }
}