export interface InfrastructureNode {
  id: string;        // Formerly @id
  name: string;      // Formerly label
  type: 'substation' | 'asset' | 'generator'; // Formerly @type
  location: [number, number]; // [Lat, Lng] for the Map
  supplies?: string[]; // IDs it supplies
}

export interface SensorReading {
  id: string;
  val: number;       // Formerly temperature
  type: 'temp' | 'load' | 'fuel';
}

// Helper to avoid errors in the old service
export interface InfrastructureGraph {
  nodes: InfrastructureNode[];
}