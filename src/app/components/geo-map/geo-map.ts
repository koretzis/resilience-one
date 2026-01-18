import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { InfrastructureNode } from '../../models/infrastructure.model';
import { SimulationService } from '../../services/simulation';
import { selectNodes } from '../../store/infrastructure.selectors';

@Component({
  selector: 'app-geo-map',
  standalone: true,
  template: `<div id="map" style="height: 500px; width: 100%;"></div>`
})
export class GeoMapComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  private markers: Map<string, L.CircleMarker> = new Map();
  private sub = new Subscription();

  constructor(
    private store: Store,
    private simService: SimulationService 
  ) {}

  ngOnInit() {
    this.initMap();

    // 1. Load Static Nodes from Store
    this.sub.add(
      this.store.select(selectNodes).subscribe(nodes => {
        if (nodes.length) this.renderNodes(nodes);
      })
    );

    // 2. Load Live Simulation Data directly from Service
    this.sub.add(
      this.simService.getSimulation().subscribe(readings => {
        readings.forEach(reading => {
          this.updateMarker(reading.id, reading.val, reading.type);
        });
      })
    );
  }

  private initMap(): void {
    this.map = L.map('map').setView([37.979, 23.736], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  }

  private renderNodes(nodes: InfrastructureNode[]): void {
    nodes.forEach(node => {
      const color = node.type === 'substation' ? '#3f51b5' : '#f44336';
      
      const marker = L.circleMarker(node.location, {
        radius: 10,
        fillColor: color,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8
      }).addTo(this.map);

      marker.bindPopup(`
        <b>${node.name}</b><br>
        Type: ${node.type}<br>
        ID: ${node.id}
      `);

      this.markers.set(node.id, marker);
    });
  }

  private updateMarker(id: string, val: number, type: string) {
    const marker = this.markers.get(id);
    if (marker) {
      // PhD Logic: Χρωματισμός βάσει τύπου και τιμής
      let color = '#4caf50'; // Green (Safe)
      
      if (type === 'temp' && val > 90) color = '#f44336'; // Red (Fire)
      if (type === 'load' && val > 90) color = '#ff9800'; // Orange (Overload)
      if (type === 'fuel' && val < 20) color = '#9c27b0'; // Purple (Empty)

      marker.setStyle({ fillColor: color });
      
      // Update Popup Content dynamically
      const currentPopup = marker.getPopup()?.getContent() as string;
      if (currentPopup) {
         marker.setPopupContent(currentPopup.split('<hr>')[0] + `<hr>Current Val: ${val.toFixed(1)}`);
      }
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}