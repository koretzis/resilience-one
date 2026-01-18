import { createReducer, on } from '@ngrx/store';
import { loadGraphSuccess, updateReadings } from './infrastructure.actions';
import { InfrastructureNode } from '../models/infrastructure.model';

export interface AppState {
  nodes: InfrastructureNode[]; // The static graph structure
  readings: Record<string, number>; // Fast look-up for current temps
}

export const initialState: AppState = {
  nodes: [],
  readings: {}
};

export const infrastructureReducer = createReducer(
  initialState,
  
  // Save the graph structure when loaded
  on(loadGraphSuccess, (state, { nodes }) => ({ ...state, nodes })),

  // Update the temperature readings map
  on(updateReadings, (state, { readings }) => {
    // Convert array to Map for O(1) lookup performance
    const newReadings = { ...state.readings };
    readings.forEach(r => newReadings[r.id] = r.temperature);
    return { ...state, readings: newReadings };
  })
);