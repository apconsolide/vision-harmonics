
import React, { memo } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { NodeData } from '@/types/visualizer';
import { Calendar, FileText, User, Brain, MapPin, Clock } from 'lucide-react';

// Concept Node
const ConceptNode: React.FC<NodeProps<NodeData>> = memo(({ data }) => {
  const nodeSize = data.size === 'large' ? 'h-32 w-32' : 
                   data.size === 'small' ? 'h-16 w-16' : 'h-24 w-24';
  
  return (
    <div className={`rounded-lg bg-white dark:bg-gray-800 p-3 border-2 shadow-md ${nodeSize} flex flex-col justify-center items-center`}
         style={{ borderColor: data.category ? undefined : '#E5E7EB' }}>
      <div className="mb-2 text-indigo-600 dark:text-indigo-400">
        <Brain size={20} />
      </div>
      <div className="font-medium text-center break-words w-full">
        {data.label}
      </div>
      {data.description && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center overflow-hidden text-ellipsis">
          {data.description.length > 30 ? data.description.substring(0, 30) + '...' : data.description}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-blue-500 border-2 border-white"
      />
    </div>
  );
});

// Document Node
const DocumentNode: React.FC<NodeProps<NodeData>> = memo(({ data }) => {
  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 p-3 border-2 border-indigo-300 shadow-md h-28 w-24 flex flex-col justify-start items-center relative">
      {/* Document Top Corner Fold */}
      <div className="absolute top-0 right-0 w-0 h-0 border-t-8 border-r-8 border-t-indigo-300 border-r-indigo-300" 
           style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}></div>
      
      <div className="mb-2 text-indigo-600 dark:text-indigo-400">
        <FileText size={20} />
      </div>
      
      <div className="font-medium text-center text-sm break-words w-full">
        {data.label}
      </div>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-indigo-500 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-indigo-500 border-2 border-white"
      />
    </div>
  );
});

// Event Node
const EventNode: React.FC<NodeProps<NodeData>> = memo(({ data }) => {
  const dateStr = data.metadata?.date ? 
    (typeof data.metadata.date === 'string' ? data.metadata.date : '') : '';
  
  return (
    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/40 p-2 border-2 border-amber-400 shadow-md min-h-24 w-40 flex flex-col">
      <div className="flex justify-center mb-1 text-amber-600 dark:text-amber-400">
        <Calendar size={16} />
      </div>
      <div className="font-medium text-center break-words w-full">
        {data.label}
      </div>
      {dateStr && (
        <div className="text-xs text-amber-700 dark:text-amber-300 font-semibold mt-1 text-center">
          {dateStr}
        </div>
      )}
      {data.description && (
        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 overflow-hidden text-ellipsis">
          {data.description.length > 50 ? data.description.substring(0, 50) + '...' : data.description}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-amber-500 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-amber-500 border-2 border-white"
      />
    </div>
  );
});

// Person Node
const PersonNode: React.FC<NodeProps<NodeData>> = memo(({ data }) => {
  return (
    <div className="rounded-full bg-blue-50 dark:bg-blue-900/40 p-3 border-2 border-blue-400 shadow-md h-24 w-24 flex flex-col justify-center items-center">
      <div className="w-10 h-10 bg-blue-200 dark:bg-blue-700 rounded-full mb-1 flex justify-center items-center">
        <User className="text-blue-600 dark:text-blue-200" size={16} />
      </div>
      <div className="font-medium text-center text-sm break-words w-full">
        {data.label}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-blue-500 border-2 border-white"
      />
    </div>
  );
});

// Place Node
const PlaceNode: React.FC<NodeProps<NodeData>> = memo(({ data }) => {
  return (
    <div className="rounded-lg bg-green-50 dark:bg-green-900/40 p-3 border-2 border-green-400 shadow-md h-24 w-24 flex flex-col justify-center items-center">
      <div className="mb-2 text-green-600 dark:text-green-400">
        <MapPin size={20} />
      </div>
      <div className="font-medium text-center text-sm break-words w-full">
        {data.label}
      </div>
      {data.description && (
        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 overflow-hidden text-ellipsis">
          {data.description.length > 30 ? data.description.substring(0, 30) + '...' : data.description}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-green-500 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-green-500 border-2 border-white"
      />
    </div>
  );
});

// Date Node
const DateNode: React.FC<NodeProps<NodeData>> = memo(({ data }) => {
  return (
    <div className="rounded-lg bg-purple-50 dark:bg-purple-900/40 p-3 border-2 border-purple-400 shadow-md h-16 w-40 flex items-center justify-between">
      <Clock className="text-purple-600 dark:text-purple-400 mr-2" size={16} />
      <div className="font-medium text-center text-sm break-words flex-1">
        {data.label}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-purple-500 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-purple-500 border-2 border-white"
      />
    </div>
  );
});

export const nodeTypes = {
  concept: ConceptNode,
  document: DocumentNode,
  event: EventNode,
  person: PersonNode,
  place: PlaceNode,
  date: DateNode
};
