import { Component, AfterViewInit, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { InfrastructureService } from '../../services/infrastructure';
import { InfrastructureNode } from '../../models/infrastructure.model';
import { SimulationService } from '../../services/simulation';

@Component({
  selector: 'app-geo-map',
  templateUrl: './geo-map.html',
  styleUrls: ['./geo-map.scss']
})
export class GeoMap implements AfterViewInit, OnInit {
  private map!: L.Map;
  private markers: Map<string, L.CircleMarker> = new Map(); // Store markers to update them later

constructor(
  private infraService: InfrastructureService,
  private simService: SimulationService // Inject here
) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnInit(): void {
    // Load the JSON-LD data and plot it
    this.infraService.loadGridData().subscribe(data => {
      this.plotNodes(data['@graph']);
    });
  }

  private initMap(): void {
    // Centered on Athens
    this.map = L.map('map').setView([37.979, 23.735], 13);

    // Dark Mode Tiles (CartoDB Dark Matter) - Perfect for "Crisis" dashboards
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(this.map);
  }

  private plotNodes(nodes: InfrastructureNode[]): void {
    const nodeIds: string[] = [];
    nodes.forEach(node => {
      // Color logic: Power Nodes = Cyan, Hospitals = Orange
      const color = node['@type'] === 'PowerNode' ? '#00bcd4' : '#ff9800';

      const marker = L.circleMarker(node.location, {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(this.map);

      // Bind a semantic popup (Good for PhD demo)
      marker.bindPopup(`
        <b>${node.label}</b><br>
        Type: ${node['@type']}<br>
        Status: ${node.status}
      `);

      // Save reference so we can update color later by ID
      this.markers.set(node['@id'], marker);
      nodeIds.push(node['@id']); // Collect IDs
    });

    // Start the "IoT Stream"
    this.startLiveUpdates(nodeIds);
  }
  private startLiveUpdates(ids: string[]): void {
  this.simService.getSensorStream(ids).subscribe(readings => {
    readings.forEach(reading => {
      const marker = this.markers.get(reading.id);
      if (marker) {
        // Visual Logic: If Temp > 80, turn RED (Anomaly)
        const isCritical = reading.temperature > 80;
        const newColor = isCritical ? '#ff0055' : (reading.id.includes('hosp') ? '#ff9800' : '#00bcd4');
        
        marker.setStyle({ fillColor: newColor });
        
        // Optional: Pulse radius effect for critical nodes
        marker.setRadius(isCritical ? 12 : 8);
      }
    });
  });
  }
}