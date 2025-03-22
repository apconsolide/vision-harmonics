
export interface NodeData {
  id?: string;
  label: string;
  description?: string;
  category?: string;
  size?: 'small' | 'medium' | 'large';
  importance?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface EdgeData {
  id?: string;
  label?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

export interface VisualizerState {
  darkMode: boolean;
  selectedNode: string | null;
  layout: 'force' | 'hierarchical' | 'radial';
  nodeSize: number;
  edgeThickness: number;
  showMinimap: boolean;
  showGrid: boolean;
}
