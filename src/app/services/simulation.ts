import { Injectable } from '@angular/core';
import { Observable, interval, map, share, tap, Subject } from 'rxjs'; // <--- +Subject
import { Socket } from 'ngx-socket-io';
import { SensorReading } from '../models/infrastructure.model';

@Injectable({ providedIn: 'root' })
export class SimulationService {
  private sharedStream$!: Observable<SensorReading[]>;
  private timeStep = 0; 
  
  // 1. Δημιουργούμε ένα κανάλι για τα Alerts
  public alertSubject = new Subject<any>();

  constructor(private socket: Socket) {
    this.socket.fromEvent('inference_alert').subscribe((data: any) => {
      console.log(`🦉 ALERT RECEIVED: [${data.type}] ${data.msg}`);
      
      // 2. Στέλνουμε το Alert σε όποιον ακούει (στο UI)
      this.alertSubject.next(data);
    });
  }

  // Helper για να ακούει το Component
  getAlerts(): Observable<any> {
    return this.alertSubject.asObservable();
  }

  getSimulation(): Observable<SensorReading[]> {
    if (this.sharedStream$) return this.sharedStream$;

    this.sharedStream$ = interval(1000).pipe(
      map(() => {
        this.timeStep++;
        console.log(`⏱️ Step: ${this.timeStep}`);

        // ΣΕΝΑΡΙΟ:
        let syntagmaTemp = this.timeStep >= 6 ? 95 : 45; 
        let omoniaLoad = this.timeStep >= 12 ? 95 : 45; 
        let genFuel = this.timeStep >= 20 ? 15 : 100;

        return [
          { id: 'sub-syntagma', val: syntagmaTemp, type: 'temp' },
          { id: 'sub-omonia', val: omoniaLoad, type: 'load' },
          { id: 'gen-evangelismos', val: genFuel, type: 'fuel' }
        ] as SensorReading[];
      }),
      tap((data) => {
        this.socket.emit('sensor_update', data);
      }),
      share()
    );

    return this.sharedStream$;
  }
}