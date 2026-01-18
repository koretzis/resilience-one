import { Injectable } from '@angular/core';
import { Observable, interval, map, share, tap } from 'rxjs';
import { Socket } from 'ngx-socket-io';

export interface SensorReading {
  id: string;
  temperature: number;
}

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private sharedStream$!: Observable<SensorReading[]>;

  constructor(private socket: Socket) {
    // 1. Ενημέρωση ότι συνδεθήκαμε
    this.socket.fromEvent('connect').subscribe(() => {
      console.log('✅ ANGULAR: Connected to Neuro-Symbolic Engine');
    });

    // 2. Η ΚΟΥΚΟΥΒΑΓΙΑ (Το πιο σημαντικό)
    // Ακούει πότε η Python θα στείλει το σήμα κινδύνου
    this.socket.fromEvent('inference_alert').subscribe((data: any) => {
      console.warn('🦉 [OWL INFERENCE RECEIVED]', data);
      
      // Εμφανίζει Popup στην οθόνη του χρήστη
      alert(`⚠️ CRITICAL ALERT: ${data.msg}`);
    });
  }

  getSensorStream(nodeIds: string[]): Observable<SensorReading[]> {
    if (this.sharedStream$) {
      return this.sharedStream$;
    }

    // Κάθε 1 δευτερόλεπτο στέλνει νέα δεδομένα
    this.sharedStream$ = interval(1000).pipe(
      map(() => {
        return nodeIds.map(id => {
          let newTemp = 40 + Math.random() * 20; // Κανονική θερμοκρασία
          
          // ANOMALY INJECTION:
          // 15% πιθανότητα το Σύνταγμα να βαρέσει 95 βαθμούς
          if (id === 'sub-syntagma' && Math.random() > 0.85) {
            newTemp = 95; 
          }
          return { id, temperature: newTemp };
        });
      }),
      tap((readings) => {
        readings.forEach(r => {
          // Στέλνουμε ΜΟΝΟ το Σύνταγμα στην Python για έλεγχο
          if (r.id === 'sub-syntagma') {
            this.socket.emit('sensor_update', { id: r.id, temp: r.temperature });
          }
        });
      }),
      share()
    );

    return this.sharedStream$;
  }
}