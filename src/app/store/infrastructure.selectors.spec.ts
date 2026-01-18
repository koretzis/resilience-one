import { selectCascadingRisks } from './infrastructure.selectors';
import { InfrastructureNode } from '../models/infrastructure.model';

describe('Neuro-Symbolic Reasoning Engine', () => {
  // 1. Setup Mock Data (The "Knowledge Graph")
  const mockNodes: InfrastructureNode[] = [
    {
      '@id': 'source-1',
      '@type': 'PowerNode',
      label: 'Main Generator',
      location: [0, 0],
      supplies: ['victim-1'] // source-1 -> supplies -> victim-1
    },
    {
      '@id': 'victim-1',
      '@type': 'CriticalAsset',
      label: 'City Hospital',
      location: [0, 0]
    }
  ];

  it('should infer a risk when a supplier overheats (Symbolic Inference)', () => {
    // 2. Setup Mock State (The "Neural Input")
    // Simulate the source node overheating (90 degrees)
    const mockReadings = {
      'source-1': 90, 
      'victim-1': 20
    };

    // 3. Execute the Selector
    const result = selectCascadingRisks.projector(mockNodes, mockReadings);

    // 4. Assert the Result
    // Expect the logic to have found the connection and raised the specific alert
    expect(result.length).toBe(1);
    expect(result[0]).toContain('City Hospital at risk');
  });

  it('should return no alerts when temperature is nominal', () => {
    const mockReadings = { 'source-1': 50, 'victim-1': 20 };
    const result = selectCascadingRisks.projector(mockNodes, mockReadings);
    expect(result.length).toBe(0);
  });
});