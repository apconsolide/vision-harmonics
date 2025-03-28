
import { Node, Edge } from '@xyflow/react';

export interface NodeData {
  id?: string;
  label: string;
  description?: string;
  category?: string;
  size?: 'small' | 'medium' | 'large';
  importance?: number;
  metadata?: Record<string, any>;
  entityType?: 'concept' | 'event' | 'person' | 'document' | 'place' | 'date';
  [key: string]: any; // Add index signature to satisfy Record<string, unknown>
}

export interface EdgeData {
  id?: string;
  label?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  [key: string]: any; // Add index signature
}

export interface VisualizerState {
  darkMode: boolean;
  selectedNode: string | null;
  layout: 'force' | 'hierarchical' | 'radial' | 'timeline';
  nodeSize: number;
  edgeThickness: number;
  showMinimap: boolean;
  showGrid: boolean;
}

export interface TimelineEvent {
  id: string;
  timeline_id: string;
  title: string;
  description?: string;
  date: string;
  category?: string;
  position?: string;
}

export interface Timeline {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  user_id?: string;
}

export interface HistoricalData {
  timelines: Timeline[];
  events: TimelineEvent[];
  userText?: string; // Add user text field for free-form text input
}

export interface HistoricalTextInput {
  text: string;
  title?: string; 
  context?: string;
  era?: string;
}

// Import the NodeProps type to fix our type issues
export type { NodeProps, Edge as FlowEdge } from '@xyflow/react';
