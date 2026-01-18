import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InfrastructureGraph } from '../models/infrastructure.model';

@Injectable({
  providedIn: 'root'
})
export class InfrastructureService {
  private dataUrl = '/assets/data/athens-grid.json';

  constructor(private http: HttpClient) { }

  // Fetches the semantic graph data
  loadGridData(): Observable<InfrastructureGraph> {
    return this.http.get<InfrastructureGraph>(this.dataUrl);
  }
}