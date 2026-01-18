export interface InfrastructureNode {
  id: string;        // Πρώην @id
  name: string;      // Πρώην label
  type: 'substation' | 'asset' | 'generator'; // Πρώην @type
  location: [number, number]; // [Lat, Lng] για τον Χάρτη
  supplies?: string[]; // IDs που τροφοδοτεί
}

export interface SensorReading {
  id: string;
  val: number;       // Πρώην temperature
  type: 'temp' | 'load' | 'fuel';
}

// Helper για να μην χτυπάει το παλιό service
export interface InfrastructureGraph {
  nodes: InfrastructureNode[];
}