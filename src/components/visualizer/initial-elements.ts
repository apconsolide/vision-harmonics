
import { Node, Edge, MarkerType } from '@xyflow/react';

export const initialNodes: Node[] = [
  {
    id: 'node-1',
    type: 'concept',
    position: { x: 250, y: 150 },
    data: {
      label: 'Main Concept',
      description: 'The central concept of the visualization',
      category: 'primary',
      size: 'large',
      importance: 1,
      metadata: {
        createdDate: '2023-10-15',
        author: 'System'
      }
    }
  },
  {
    id: 'node-2',
    type: 'concept',
    position: { x: 100, y: 300 },
    data: {
      label: 'Related Concept A',
      description: 'A concept related to the main concept',
      category: 'secondary',
      importance: 0.8,
      metadata: {
        createdDate: '2023-10-16',
        author: 'System'
      }
    }
  },
  {
    id: 'node-3',
    type: 'concept',
    position: { x: 400, y: 300 },
    data: {
      label: 'Related Concept B',
      description: 'Another concept related to the main concept',
      category: 'tertiary',
      importance: 0.8,
      metadata: {
        createdDate: '2023-10-16',
        author: 'System'
      }
    }
  },
  {
    id: 'node-4',
    type: 'subConcept',
    position: { x: 50, y: 450 },
    data: {
      label: 'Subconcept A1',
      category: 'secondary',
      importance: 0.6
    }
  },
  {
    id: 'node-5',
    type: 'subConcept',
    position: { x: 175, y: 450 },
    data: {
      label: 'Subconcept A2',
      category: 'secondary',
      importance: 0.6
    }
  },
  {
    id: 'node-6',
    type: 'subConcept',
    position: { x: 350, y: 450 },
    data: {
      label: 'Subconcept B1',
      category: 'tertiary',
      importance: 0.6
    }
  },
  {
    id: 'node-7',
    type: 'subConcept',
    position: { x: 475, y: 450 },
    data: {
      label: 'Subconcept B2',
      category: 'tertiary',
      importance: 0.6
    }
  },
  {
    id: 'node-8',
    type: 'concept',
    position: { x: 600, y: 200 },
    data: {
      label: 'Connected Concept',
      description: 'A concept connected through a network relationship',
      category: 'quaternary',
      importance: 0.7
    }
  },
  {
    id: 'node-9',
    type: 'group',
    position: { x: 500, y: 500 },
    style: { width: 300, height: 200 },
    data: {
      label: 'Grouped Concepts'
    }
  },
  {
    id: 'node-10',
    type: 'concept',
    parentId: 'node-9',
    position: { x: 50, y: 50 },
    data: {
      label: 'Grouped A',
      category: 'success',
      importance: 0.7
    },
    extent: 'parent'
  },
  {
    id: 'node-11',
    type: 'concept',
    parentId: 'node-9',
    position: { x: 200, y: 100 },
    data: {
      label: 'Grouped B',
      category: 'info',
      importance: 0.7
    },
    extent: 'parent'
  }
];

export const initialEdges: Edge[] = [
  {
    id: 'edge-1-2',
    source: 'node-1',
    target: 'node-2',
    type: 'hierarchical',
    animated: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20
    },
    data: {
      label: 'Parent-Child'
    }
  },
  {
    id: 'edge-1-3',
    source: 'node-1',
    target: 'node-3',
    type: 'hierarchical',
    animated: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20
    },
    data: {
      label: 'Parent-Child'
    }
  },
  {
    id: 'edge-2-4',
    source: 'node-2',
    target: 'node-4',
    type: 'hierarchical',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15
    }
  },
  {
    id: 'edge-2-5',
    source: 'node-2',
    target: 'node-5',
    type: 'hierarchical',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15
    }
  },
  {
    id: 'edge-3-6',
    source: 'node-3',
    target: 'node-6',
    type: 'hierarchical',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15
    }
  },
  {
    id: 'edge-3-7',
    source: 'node-3',
    target: 'node-7',
    type: 'hierarchical',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15
    }
  },
  {
    id: 'edge-1-8',
    source: 'node-1',
    target: 'node-8',
    type: 'network',
    animated: true,
    data: {
      label: 'Related'
    }
  },
  {
    id: 'edge-8-3',
    source: 'node-8',
    target: 'node-3',
    type: 'network',
    animated: true
  },
  {
    id: 'edge-3-10',
    source: 'node-3',
    target: 'node-10',
    type: 'network'
  },
  {
    id: 'edge-7-11',
    source: 'node-7',
    target: 'node-11',
    type: 'network'
  }
];
