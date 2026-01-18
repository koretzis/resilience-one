import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GeoMapComponent } from './components/geo-map/geo-map';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GeoMapComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('resilience-one');
}
