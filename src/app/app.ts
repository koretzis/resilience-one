import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GeoMap } from './components/geo-map/geo-map';
import { KnowledgeGraph } from './components/knowledge-graph/knowledge-graph';
import { AlertPanel } from './components/alert-panel/alert-panel';
import { Store } from '@ngrx/store';
import { loadGraphSuccess, updateReadings } from './store/infrastructure.actions';
import { InfrastructureService } from './services/infrastructure';
import { SimulationService } from './services/simulation';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GeoMap, KnowledgeGraph, AlertPanel],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  constructor(
    private store: Store, // Inject Store
    private infra: InfrastructureService,
    private sim: SimulationService
  ) {}

  ngOnInit() {
    // 1. Load Static Graph into Store
    this.infra.loadGridData().subscribe(data => {
      this.store.dispatch(loadGraphSuccess({ nodes: data['@graph'] }));
      
      // 2. Connect Simulation to Store
      const ids = data['@graph'].map(n => n['@id']);
      this.sim.getSensorStream(ids).subscribe(readings => {
        this.store.dispatch(updateReadings({ readings }));
      });
    });
  }
}