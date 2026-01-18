export interface InfrastructureNode {
  '@id': string;
  '@type': 'PowerNode' | 'CriticalAsset';
  label: string;
  location: [number, number]; // [Lat, Lng]
  supplies?: string[]; // Array of IDs this node connects to
  status?: 'nominal' | 'warning' | 'critical' | 'active';
  temperature?: number;
  priority?: 'High' | 'Medium' | 'Low';
}

export interface InfrastructureGraph {
  '@context': any;
  '@graph': InfrastructureNode[];
}