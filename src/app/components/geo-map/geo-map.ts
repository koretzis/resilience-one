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
  styles: [] // Styles are placed in styles.css to ensure Leaflet sees them
})
export class GeoMapComponent implements OnInit {
  map!: L.Map;
  markers: { [id: string]: L.Marker } = {};

  // Dark map (CartoDB Dark Matter) to make Glowing LEDs visible
  options = {
    layers: [
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { 
        maxZoom: 18, 
        attribution: '© OpenStreetMap & CartoDB' 
      })
    ],
    zoom: 13,
    center: L.latLng(37.9900, 23.7300) // Center of Athens
  };

  constructor(private simService: SimulationService) {}

  ngOnInit() {
    // 1. Get Locations (Runs once at the beginning)
    this.simService.getTopology().subscribe((nodes: any[]) => {
      console.log("📍 Map Nodes Loaded:", nodes.length);
      nodes.forEach(node => {
        this.addMarker(node.id, node.lat, node.lng, node.name);
      });
    });

    // 2. Live Update (Runs continuously)
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

  // Add LED Marker (Initial state: Safe)
  addMarker(id: string, lat: number, lng: number, title: string) {
    if (this.markers[id]) return;

    // We use divIcon to add CSS classes (Glowing Dots)
    const ledIcon = L.divIcon({
      className: 'custom-div-icon', // Necessary for Leaflet
      html: `<div class="led-marker status-safe" id="icon-${id}"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([lat, lng], { icon: ledIcon, title: title }).addTo(this.map);

    // Initial Popup
    marker.bindPopup(`
      <div style="text-align:center; color: #333;">
        <h3>${title}</h3>
        <p>Waiting for data...</p>
      </div>
    `);
    
    this.markers[id] = marker;
  }

  // Update Color and Popup
  updateMarkerVisuals(id: string, val: number, type: string) {
    const marker = this.markers[id];
    if (!marker) return;

    // --- 1. Risk Calculation ---
    let statusClass = 'status-safe';
    let isCritical = false;

    // Logic: If > 90% load or < 20% fuel -> Critical
    if (type.includes('Fuel')) {
      if (val < 20) { statusClass = 'status-critical'; isCritical = true; }
      else if (val < 40) statusClass = 'status-warning';
    } else {
      // Load / Temp
      if (val > 90) { statusClass = 'status-critical'; isCritical = true; }
      else if (val > 75) statusClass = 'status-warning';
    }

    // --- 2. Color Change (Changing Icon HTML) ---
    // This makes the light change color without recreating the marker
    const iconElement = document.getElementById(`icon-${id}`);
    if (iconElement) {
      // Clear old classes and add the new one
      iconElement.className = `led-marker ${statusClass}`;
    }

    // --- 3. Live Popup Text Update ---
    const valFixed = val.toFixed(1);
    const colorStyle = isCritical ? 'red' : (statusClass === 'status-warning' ? 'orange' : 'green');
    
    // Construct HTML content
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

    // Here is the secret: setPopupContent updates the open popup!
    marker.setPopupContent(popupContent);
  }
}