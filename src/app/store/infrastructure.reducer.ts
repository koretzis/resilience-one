import { createReducer, on } from '@ngrx/store';
import * as InfrastructureActions from './infrastructure.actions';
import { InfrastructureNode, SensorReading } from '../models/infrastructure.model';

export interface AppState {
  nodes: InfrastructureNode[];
  readings: SensorReading[];
  loading: boolean;
  error: any;
}

export const initialState: AppState = {
  nodes: [
    { 
      id: 'sub-syntagma', 
      name: 'Syntagma Substation', 
      type: 'substation', 
      location: [37.9755, 23.7348], // <--- ΠΡΟΣΘΗΚΗ
      supplies: ['hosp-evangelismos'] 
    },
    { 
      id: 'sub-omonia', 
      name: 'Omonia Substation', 
      type: 'substation', 
      location: [37.9841, 23.7280], // <--- ΠΡΟΣΘΗΚΗ
      supplies: ['sub-syntagma'] 
    },
    { 
      id: 'hosp-evangelismos', 
      name: 'Evangelismos Hospital', 
      type: 'asset', 
      location: [37.9768, 23.7478], // <--- ΠΡΟΣΘΗΚΗ
      supplies: [] 
    },
    { 
      id: 'gen-evangelismos', 
      name: 'Backup Generator', 
      type: 'generator', 
      location: [37.9765, 23.7480], // <--- ΠΡΟΣΘΗΚΗ
      supplies: [] 
    }
  ],
  readings: [],
  loading: false,
  error: null
};

export const infrastructureReducer = createReducer(
  initialState,
  on(InfrastructureActions.loadGraphSuccess, (state, { nodes }) => ({
    ...state,
    nodes,
    loading: false
  })),
  on(InfrastructureActions.updateReadings, (state, { readings }) => ({
    ...state,
    readings: [...readings]
  }))
);