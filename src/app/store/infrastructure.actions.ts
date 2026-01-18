import { createAction, props } from '@ngrx/store';
import { SensorReading } from '../services/simulation';
import { InfrastructureNode } from '../models/infrastructure.model';

// 1. Initialize the Graph (Symbolic Data)
export const loadGraphSuccess = createAction(
  '[API] Load Graph Success',
  props<{ nodes: InfrastructureNode[] }>()
);

// 2. Real-time Updates (Neuro Data)
export const updateReadings = createAction(
  '[IoT] Update Readings',
  props<{ readings: SensorReading[] }>()
);