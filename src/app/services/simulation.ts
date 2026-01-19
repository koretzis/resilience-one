import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Socket } from 'ngx-socket-io';

@Injectable({ providedIn: 'root' })
export class SimulationService {
  public dataSubject = new Subject<any>();
  public topologySubject = new Subject<any>();

  constructor(private socket: Socket) {
    // 1. Λήψη Τοπολογίας (Nodes) κατά τη σύνδεση
    this.socket.fromEvent('topology_init').subscribe((nodes) => {
      console.log('🗺️ Topology Received:', nodes);
      this.topologySubject.next(nodes);
    });

    // 2. Λήψη Βήματος Εξομοίωσης (Δεδομένα + ML + Alerts)
    this.socket.fromEvent('simulation_step').subscribe((data: any) => {
      this.dataSubject.next(data);
      
      // Ζητάμε το επόμενο βήμα μετά από 1 δευτερόλεπτο (Loop)
      setTimeout(() => {
        this.socket.emit('request_next_step');
      }, 1000); 
    });

    // Έναυσμα: Ζητάμε το πρώτο πακέτο μόλις συνδεθούμε
    this.socket.fromEvent('connect').subscribe(() => {
      this.socket.emit('request_next_step');
    });
  }

  getUpdates() { return this.dataSubject.asObservable(); }
  getTopology() { return this.topologySubject.asObservable(); }
}