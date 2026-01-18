import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from './infrastructure.reducer';

export const selectFeature = createFeatureSelector<AppState>('infrastructure');

// 1. Select the Raw Graph
export const selectNodes = createSelector(selectFeature, (state) => state.nodes);
export const selectReadings = createSelector(selectFeature, (state) => state.readings);

// 2. THE REASONING ENGINE (Neuro-Symbolic Logic)
// Combines Static Graph (Symbolic) + Live Data (Neuro) to find CASCADE RISKS.
export const selectCascadingRisks = createSelector(
  selectNodes,
  selectReadings,
  (nodes, readings) => {
    const alerts: string[] = [];

    // Find nodes that are failing
    const failingNodes = nodes.filter(n => (readings[n['@id']] || 0) > 85);

    failingNodes.forEach(source => {
      // Logic: If Source is failing, find what it supplies
      if (source.supplies) {
        source.supplies.forEach(targetId => {
          // Find the victim node object
          const victim = nodes.find(n => n['@id'] === targetId);
          
          if (victim) {
            // INFERENCE GENERATED:
            alerts.push(`CRITICAL: ${victim.label} at risk due to failure in ${source.label}`);
          }
        });
      }
    });

    return alerts;
  }
);