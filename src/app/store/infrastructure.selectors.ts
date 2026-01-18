import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from './infrastructure.reducer';
import { InfrastructureNode, SensorReading } from '../models/infrastructure.model';

// Select the Feature State
export const selectFeature = createFeatureSelector<AppState>('infrastructure');

// 1. Select Raw Data
export const selectNodes = createSelector(selectFeature, (state) => state.nodes);
export const selectReadings = createSelector(selectFeature, (state) => state.readings);

// 2. THE REASONING ENGINE (Frontend Logic Layer)
export const selectCascadingRisks = createSelector(
  selectNodes,
  selectReadings,
  (nodes: InfrastructureNode[], readings: SensorReading[]) => {
    const alerts: string[] = [];

    // Βοηθητική: Βρες την εγγραφή για ένα συγκεκριμένο Node ID
    const getReading = (id: string) => readings.find(r => r.id === id);

    // [Step 1: NEURO LAYER] 
    // Detect Anomalies based on Physics (Thresholds)
    const failingNodes = nodes.filter(node => {
      const reading = getReading(node.id); // Χρησιμοποιούμε node.id (όχι @id)
      
      if (!reading) return false;

      // Πολυ-παραμετρικός έλεγχος (PhD Logic)
      if (reading.type === 'temp' && reading.val > 90) return true; // Overheating
      if (reading.type === 'load' && reading.val > 90) return true; // Overload
      if (reading.type === 'fuel' && reading.val < 20) return true; // Low Fuel
      
      return false;
    });

    // [Step 2: SYMBOLIC LAYER] 
    // Propagate Risk through Topology
    failingNodes.forEach(source => {
      
      // Έλεγχος: Αν αυτός ο κόμβος τροφοδοτεί άλλους (supplies property)
      // ΠΡΟΣΟΧΗ: Αυτό προϋποθέτει ότι το InfrastructureNode model έχει πεδίο 'supplies'
      if (source.supplies && source.supplies.length > 0) {
        
        source.supplies.forEach(targetId => {
          const victim = nodes.find(n => n.id === targetId);
          
          if (victim) {
            alerts.push(
              `⚠️ CASCADE RISK: ${victim.name} is compromised due to failure in ${source.name}`
            );
          }
        });
      }
      
      // Προσθήκη του ίδιου του κόμβου στη λίστα κινδύνου
      alerts.push(`🚨 DIRECT FAILURE: ${source.name} is in critical state.`);
    });

    return alerts;
  }
);