import { Injectable } from '@angular/core';
import { Observable, interval, map } from 'rxjs';

export interface SensorReading {
  id: string;
  temperature: number;
}

@Injectable({
  providedIn: 'root'
})
export class SimulationService {

  // Simulates a stream of sensor updates every 1 second
  getSensorStream(nodeIds: string[]): Observable<SensorReading[]> {
    return interval(1000).pipe(
      map(() => {
        return nodeIds.map(id => {
          // 1. Generate normal noise (40-60 degrees)
          let newTemp = 40 + Math.random() * 20;

          // 2. Anomaly Injection: Occasionally spike "Syntagma Substation"
          // "Neuro" aspect: This simulates a detected anomaly pattern
          if (id === 'sub-syntagma' && Math.random() > 0.85) {
            newTemp = 95; // CRITICAL OVERHEAT
          }

          return { id, temperature: newTemp };
        });
      })
    );
  }
}