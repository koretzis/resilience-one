import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import { SimulationService } from '../../../../src/app/services/simulation';

@Component({
  selector: 'app-geo-map',
  standalone: true,
  imports: [CommonModule, LeafletModule],
  template: `
    <div style="height: 400px;"
         leaflet 
         [leafletOptions]="options"
         (leafletMapReady)="onMapReady($event)">
    </div>
  `,
  styles: []
})
export class GeoMapComponent implements OnInit {
  map!: L.Map;
  markers: { [id: string]: L.Marker } = {};

  // Αρχικές ρυθμίσεις χάρτη (Αθήνα)
  options = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 13,
    center: L.latLng(37.9838, 23.7275)
  };

  constructor(private simService: SimulationService) {}

  ngOnInit() {
    // 1. Ακρόαση Τοπολογίας (Πραγματικές Τοποθεσίες από Python)
    this.simService.getTopology().subscribe((nodes: any[]) => {
      nodes.forEach(node => {
        this.addMarker(node.id, node.lat, node.lng, node.name);
      });
    });

    // 2. Ακρόαση Δεδομένων (Metrics)
    // ΠΡΟΣΟΧΗ: Χρησιμοποιούμε το getUpdates() και παίρνουμε το data.metrics
    this.simService.getUpdates().subscribe((data: any) => {
      const readings = data.metrics; // <--- Εδώ είναι η αλλαγή
      
      if (readings) {
        readings.forEach((r: any) => {
          this.updateMarkerColor(r.id, r.val);
        });
      }
    });
  }

  onMapReady(map: L.Map) {
    this.map = map;
  }

  addMarker(id: string, lat: number, lng: number, title: string) {
    if (this.markers[id]) return;

    const marker = L.marker([lat, lng], {
      icon: L.icon({
        // Τώρα δείχνουμε στα τοπικά assets που ρυθμίσαμε
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png',
        
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }),
      title: title
    }).addTo(this.map);

    marker.bindPopup(`
      <div style="text-align: center;">
        <b style="font-size: 1.1em;">${title}</b><br>
        <span style="color: #666;">ID: ${id}</span>
      </div>
    `);
    
    this.markers[id] = marker;
  }

  updateMarkerColor(id: string, val: number) {
    const marker = this.markers[id];
    if (!marker) return;

    // Απλή λογική χρωμάτων για το demo
    // Κόκκινο αν > 90 (φορτίο) ή < 20 (καύσιμο)
    // Προσαρμογή: Το Σύνταγμα (temp) θέλει άλλη λογική, αλλά για τώρα το αφήνουμε απλό
    let isCritical = false;
    
    if (id === 'gen-evangelismos' && val < 20) isCritical = true;
    if (id !== 'gen-evangelismos' && val > 90) isCritical = true;
    
    // Εδώ κανονικά αλλάζουμε το εικονίδιο. 
    // Για απλότητα στο demo, απλά ανοίγουμε το popup αν είναι critical
    if (isCritical) {
        marker.openPopup(); 
    } else {
        marker.closePopup();
    }
  }
}