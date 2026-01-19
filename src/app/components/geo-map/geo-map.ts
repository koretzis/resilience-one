import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import { SimulationService } from '../../services/simulation';

@Component({
  selector: 'app-geo-map',
  standalone: true,
  imports: [CommonModule, LeafletModule],
  template: `
    <div style="height: 500px; width: 100%; border-radius: 12px; border: 2px solid #333; overflow: hidden;"
         leaflet 
         [leafletOptions]="options"
         (leafletMapReady)="onMapReady($event)">
    </div>
  `,
  styles: [] // Τα στυλ τα βάλαμε στο styles.css για να τα βλέπει το Leaflet σίγουρα
})
export class GeoMapComponent implements OnInit {
  map!: L.Map;
  markers: { [id: string]: L.Marker } = {};

  // Σκούρος χάρτης (CartoDB Dark Matter) για να φαίνονται τα Glowing LEDs
  options = {
    layers: [
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { 
        maxZoom: 18, 
        attribution: '© OpenStreetMap & CartoDB' 
      })
    ],
    zoom: 13,
    center: L.latLng(37.9900, 23.7300) // Κέντρο Αθήνας
  };

  constructor(private simService: SimulationService) {}

  ngOnInit() {
    // 1. Λήψη Τοποθεσιών (Τρέχει μία φορά στην αρχή)
    this.simService.getTopology().subscribe((nodes: any[]) => {
      console.log("📍 Map Nodes Loaded:", nodes.length);
      nodes.forEach(node => {
        this.addMarker(node.id, node.lat, node.lng, node.name);
      });
    });

    // 2. Ζωντανή Ενημέρωση (Τρέχει συνέχεια)
    this.simService.getUpdates().subscribe((data: any) => {
      const metrics = data.metrics;
      if (metrics) {
        metrics.forEach((r: any) => {
          this.updateMarkerVisuals(r.id, r.val, r.type);
        });
      }
    });
  }

  onMapReady(map: L.Map) {
    this.map = map;
  }

  // Προσθήκη LED Marker (Αρχική κατάσταση: Safe)
  addMarker(id: string, lat: number, lng: number, title: string) {
    if (this.markers[id]) return;

    // Χρησιμοποιούμε divIcon για να βάλουμε CSS classes (Glowing Dots)
    const ledIcon = L.divIcon({
      className: 'custom-div-icon', // Απαραίτητο για το Leaflet
      html: `<div class="led-marker status-safe" id="icon-${id}"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([lat, lng], { icon: ledIcon, title: title }).addTo(this.map);

    // Αρχικό Popup
    marker.bindPopup(`
      <div style="text-align:center; color: #333;">
        <h3>${title}</h3>
        <p>Waiting for data...</p>
      </div>
    `);
    
    this.markers[id] = marker;
  }

  // Ανανέωση Χρώματος και Popup
  updateMarkerVisuals(id: string, val: number, type: string) {
    const marker = this.markers[id];
    if (!marker) return;

    // --- 1. Υπολογισμός Κινδύνου ---
    let statusClass = 'status-safe';
    let isCritical = false;

    // Λογική: Αν > 90% φορτίο ή < 20% καύσιμο -> Critical
    if (type.includes('Fuel')) {
      if (val < 20) { statusClass = 'status-critical'; isCritical = true; }
      else if (val < 40) statusClass = 'status-warning';
    } else {
      // Load / Temp
      if (val > 90) { statusClass = 'status-critical'; isCritical = true; }
      else if (val > 75) statusClass = 'status-warning';
    }

    // --- 2. Αλλαγή Χρώματος (Αλλάζουμε το HTML του Icon) ---
    // Αυτό κάνει το λαμπάκι να αλλάζει χρώμα χωρίς να ξαναφτιάχνουμε τον marker
    const iconElement = document.getElementById(`icon-${id}`);
    if (iconElement) {
      // Καθαρίζουμε τα παλιά classes και βάζουμε το νέο
      iconElement.className = `led-marker ${statusClass}`;
    }

    // --- 3. Live Popup Text Update ---
    const valFixed = val.toFixed(1);
    const colorStyle = isCritical ? 'red' : (statusClass === 'status-warning' ? 'orange' : 'green');
    
    // Φτιάχνουμε το περιεχόμενο HTML
    const popupContent = `
      <div style="min-width: 140px; text-align: center; font-family: sans-serif;">
        <h4 style="margin: 0; color: #444; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          ${marker.options.title}
        </h4>
        <div style="margin-top: 10px;">
          <strong style="font-size: 14px; color: #666;">${type}</strong>
        </div>
        <div style="font-size: 24px; font-weight: bold; color: ${colorStyle}; margin: 5px 0;">
          ${valFixed}
        </div>
        <div style="font-size: 11px; background: ${colorStyle}; color: white; padding: 2px 6px; border-radius: 4px; display: inline-block;">
          ${statusClass.replace('status-', '').toUpperCase()}
        </div>
        <div style="margin-top:5px; font-size:9px; color:#aaa;">ID: ${id}</div>
      </div>
    `;

    // Εδώ είναι το μυστικό: Το setPopupContent ανανεώνει το ανοιχτό popup!
    marker.setPopupContent(popupContent);
  }
}