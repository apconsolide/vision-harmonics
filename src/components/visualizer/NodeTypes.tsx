
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '@/types/visualizer';

// Determine node size based on importance or size property
const getNodeSize = (data: NodeData): number => {
  if (data.importance && typeof data.importance === 'number') {
    return data.importance < 5 ? 120 : data.importance < 8 ? 160 : 200;
  }
  
  switch (data.size) {
    case 'small':
      return 120;
    case 'large':
      return 200;
    case 'medium':
    default:
      return 160;
  }
};

// Basic concept node
const ConceptNode = memo(({ data }: NodeProps<NodeData>) => {
  const nodeSize = getNodeSize(data);
  
  const primaryColor = (() => {
    switch (data.category) {
      case 'primary':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'secondary':
        return 'bg-purple-100 border-purple-500 text-purple-800';
      case 'tertiary':
        return 'bg-indigo-100 border-indigo-500 text-indigo-800';
      case 'quaternary':
        return 'bg-pink-100 border-pink-500 text-pink-800';
      case 'success':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'danger':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'info':
        return 'bg-cyan-100 border-cyan-500 text-cyan-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  })();
  
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-shadow ${
        primaryColor
      } shadow`}
      style={{ width: nodeSize, height: nodeSize }}
    >
      <div className="font-medium text-center break-words w-full">{data.label}</div>
      {data.description && (
        <div className="text-xs mt-2 opacity-70 text-center overflow-hidden">
          {data.description}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!bg-gray-500 border-none h-2 w-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-500 border-none h-2 w-2" />
    </div>
  );
});

// Document node
const DocumentNode = memo(({ data }: NodeProps<NodeData>) => {
  return (
    <div
      className="flex flex-col items-center bg-white border-2 rounded-md p-3 shadow"
      style={{ width: 180 }}
    >
      <div className="w-full h-4 bg-gray-200 mb-2 rounded-sm"></div>
      <div className="w-full h-4 bg-gray-200 mb-2 rounded-sm"></div>
      <div className="w-3/4 h-4 bg-gray-200 rounded-sm"></div>
      <div className="font-medium mt-2 text-center">{data.label}</div>
      {data.description && (
        <div className="text-xs mt-1 text-gray-500 overflow-hidden">
          {data.description}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!bg-gray-500 border-none h-2 w-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-500 border-none h-2 w-2" />
    </div>
  );
});

// Historical event node
const EventNode = memo(({ data }: NodeProps<NodeData>) => {
  return (
    <div
      className="flex flex-col items-center bg-amber-50 border-2 border-amber-500 rounded-md p-3 shadow-md"
      style={{ width: 200 }}
    >
      <div className="bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded-full self-start mb-2">
        {data.category || 'Event'}
      </div>
      <div className="font-medium text-center w-full">{data.label}</div>
      {data.description && (
        <div className="text-xs mt-1 text-gray-600 overflow-hidden">
          {data.description}
        </div>
      )}
      {data.metadata?.date && (
        <div className="text-xs mt-2 text-amber-700 font-semibold">
          {data.metadata.date}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!bg-amber-500 border-none h-2 w-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 border-none h-2 w-2" />
    </div>
  );
});

// Person node
const PersonNode = memo(({ data }: NodeProps<NodeData>) => {
  return (
    <div
      className="flex flex-col items-center bg-blue-50 border-2 border-blue-400 rounded-full p-4 shadow-md"
      style={{ width: 180, height: 180 }}
    >
      <div className="w-16 h-16 bg-blue-200 rounded-full mb-2 flex items-center justify-center">
        <span className="text-2xl text-blue-500">
          {data.label.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="font-medium text-center">{data.label}</div>
      {data.description && (
        <div className="text-xs mt-1 text-gray-600 text-center overflow-hidden">
          {data.description}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!bg-blue-400 border-none h-2 w-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400 border-none h-2 w-2" />
    </div>
  );
});

export const nodeTypes = {
  concept: ConceptNode,
  document: DocumentNode,
  event: EventNode,
  person: PersonNode
};
