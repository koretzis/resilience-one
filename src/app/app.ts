import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GeoMapComponent } from './components/geo-map/geo-map';
import { KnowledgeGraphComponent } from './components/knowledge-graph/knowledge-graph';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GeoMapComponent, KnowledgeGraphComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('resilience-one');
}
