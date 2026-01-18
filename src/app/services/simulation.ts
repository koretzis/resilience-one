import { Injectable } from '@angular/core';
import { Observable, interval, map, share } from 'rxjs'; // <--- Import 'share'

export interface SensorReading {
  id: string;
  temperature: number;
}

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  // Store the shared stream so we don't create new ones
  private sharedStream$!: Observable<SensorReading[]>;

  getSensorStream(nodeIds: string[]): Observable<SensorReading[]> {
    // If the stream already exists, return it (Singleton Pattern)
    if (this.sharedStream$) {
      return this.sharedStream$;
    }

    // Otherwise, create it and mark it as shared
    this.sharedStream$ = interval(1000).pipe(
      map(() => {
        return nodeIds.map(id => {
          let newTemp = 40 + Math.random() * 20;

          // The "Anomaly" Logic
          if (id === 'sub-syntagma' && Math.random() > 0.85) {
            newTemp = 95; 
          }

          return { id, temperature: newTemp };
        });
      }),
      share() // <--- THE MAGIC OPERATOR: Makes the stream "Hot"
    );

    return this.sharedStream$;
  }
}