import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InfrastructureNode } from '../models/infrastructure.model';

@Injectable({
  providedIn: 'root'
})
export class InfrastructureService {
  
  getInfrastructure(): Observable<InfrastructureNode[]> {
    // Επιστρέφουμε την τοπολογία καρφωτά για το PhD Demo
    const nodes: InfrastructureNode[] = [
      { 
        id: 'sub-syntagma', 
        name: 'Syntagma Substation', 
        type: 'substation', 
        location: [37.9755, 23.7348], 
        supplies: ['hosp-evangelismos'] 
      },
      { 
        id: 'sub-omonia', 
        name: 'Omonia Substation', 
        type: 'substation', 
        location: [37.9841, 23.7280],
        supplies: ['sub-syntagma'] 
      },
      { 
        id: 'hosp-evangelismos', 
        name: 'Evangelismos Hospital', 
        type: 'asset', 
        location: [37.9768, 23.7478],
        supplies: [] 
      },
      { 
        id: 'gen-evangelismos', 
        name: 'Backup Generator', 
        type: 'generator', 
        location: [37.9765, 23.7480],
        supplies: [] 
      }
    ];
    return of(nodes);
  }
}