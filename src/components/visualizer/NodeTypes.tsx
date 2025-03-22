import React, { memo, useMemo } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { NodeData } from '@/types/visualizer';
import { Calendar, FileText, User, Brain, MapPin, Clock, MoreHorizontal } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip'; // Assuming you have a tooltip component

// Common handle rendering function to maintain consistency
const renderHandles = (className = "w-2 h-2 bg-blue-500 border-2 border-white") => (
  <>
    <Handle
      type="source"
      position={Position.Right}
      className={className}
      id="right"
    />
    <Handle
      type="target"
      position={Position.Left}
      className={className}
      id="left"
    />
    <Handle
      type="source"
      position={Position.Bottom}
      className={className}
      id="bottom"
      style={{ display: 'none' }}
    />
    <Handle
      type="target"
      position={Position.Top}
      className={className}
      id="top"
      style={{ display: 'none' }}
    />
  </>
);

// Base node component to reduce code duplication
const BaseNode = memo(({ children, className, ariaLabel, onClick }) => (
  <div 
    className={`${className} transition-all duration-200 hover:shadow-lg`}
    onClick={onClick}
    aria-label={ariaLabel}
    role="button"
    tabIndex={0}
  >
    {children}
  </div>
));

// Truncate text utility
const TruncatedText = ({ text, maxLength, className }) => {
  if (!text) return null;
  
  const truncated = text.length > maxLength 
    ? `${text.substring(0, maxLength)}...` 
    : text;
  
  return (
    <div className={className} title={text}>
      {truncated}
    </div>
  );
};

// Concept Node
const ConceptNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const nodeSize = useMemo(() => {
    return data.size === 'large' ? 'h-32 w-32' : 
           data.size === 'small' ? 'h-16 w-16' : 'h-24 w-24';
  }, [data.size]);
  
  const borderColor = useMemo(() => {
    return selected 
      ? 'border-indigo-600 dark:border-indigo-400' 
      : data.category 
        ? `border-${data.category}-400`
        : 'border-gray-300 dark:border-gray-600';
  }, [selected, data.category]);
  
  return (
    <BaseNode 
      className={`rounded-lg bg-white dark:bg-gray-800 p-3 border-2 shadow-md ${nodeSize} flex flex-col justify-center items-center ${borderColor}`}
      ariaLabel={`Concept: ${data.label}`}
    >
      <div className="mb-2 text-indigo-600 dark:text-indigo-400">
        <Brain size={20} />
      </div>
      <div className="font-medium text-center break-words w-full">
        {data.label}
      </div>
      
      <TruncatedText 
        text={data.description}
        maxLength={30}
        className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center overflow-hidden"
      />
      
      {data.metadata && (
        <div className="absolute top-1 right-1">
          <Tooltip content={Object.entries(data.metadata).map(([key, value]) => `${key}: ${value}`).join('\n')}>
            <MoreHorizontal size={12} className="text-gray-400" />
          </Tooltip>
        </div>
      )}
      
      {renderHandles("w-2 h-2 bg-indigo-500 border-2 border-white")}
    </BaseNode>
  );
});

// Document Node with enhanced styling
const DocumentNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const borderColor = selected ? 'border-indigo-600 dark:border-indigo-500' : 'border-indigo-300 dark:border-indigo-700';
  
  return (
    <BaseNode 
      className={`rounded-lg bg-white dark:bg-gray-800 p-3 border-2 ${borderColor} shadow-md h-28 w-24 flex flex-col justify-start items-center relative`}
      ariaLabel={`Document: ${data.label}`}
    >
      {/* Document Top Corner Fold with improved styling */}
      <div className="absolute top-0 right-0 w-5 h-5 bg-indigo-100 dark:bg-indigo-800"
           style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}>
        <div className="absolute top-0 right-0 w-5 h-5 bg-indigo-300 dark:bg-indigo-600"
             style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)', transform: 'scale(0.8)' }}></div>
      </div>
      
      <div className="mb-2 text-indigo-600 dark:text-indigo-400">
        <FileText size={20} />
      </div>
      
      <div className="font-medium text-center text-sm break-words w-full">
        {data.label}
      </div>
      
      {data.metadata?.pages && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {data.metadata.pages} pages
        </div>
      )}
      
      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-indigo-500 border-2 border-white"
        id="bottom"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-indigo-500 border-2 border-white"
        id="top"
      />
    </BaseNode>
  );
});

// Event Node with improved date handling
const EventNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const dateStr = useMemo(() => {
    if (!data.metadata?.date) return '';
    
    if (typeof data.metadata.date === 'string') {
      return data.metadata.date;
    }
    
    // Handle Date objects
    if (data.metadata.date instanceof Date) {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      }).format(data.metadata.date);
    }
    
    return '';
  }, [data.metadata?.date]);
  
  const borderColor = selected ? 'border-amber-600' : 'border-amber-400';
  
  return (
    <BaseNode 
      className={`rounded-lg bg-amber-50 dark:bg-amber-900/40 p-2 border-2 ${borderColor} shadow-md min-h-24 w-40 flex flex-col`}
      ariaLabel={`Event: ${data.label}${dateStr ? ` on ${dateStr}` : ''}`}
    >
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
      
      <TruncatedText 
        text={data.description}
        maxLength={50}
        className="text-xs text-gray-600 dark:text-gray-300 mt-1 overflow-hidden"
      />
      
      {renderHandles("w-2 h-2 bg-amber-500 border-2 border-white")}
    </BaseNode>
  );
});

// Person Node with avatar support
const PersonNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const borderColor = selected ? 'border-blue-600' : 'border-blue-400';
  const avatarUrl = data.metadata?.avatarUrl;
  
  return (
    <BaseNode 
      className={`rounded-full bg-blue-50 dark:bg-blue-900/40 p-3 border-2 ${borderColor} shadow-md h-24 w-24 flex flex-col justify-center items-center`}
      ariaLabel={`Person: ${data.label}`}
    >
      <div className="w-10 h-10 rounded-full mb-1 flex justify-center items-center overflow-hidden">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={`Avatar of ${data.label}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%233B82F6'%3E%3Cpath d='M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.5 0-10 2-10 7v1h20v-1c0-5-4.5-7-10-7z'/%3E%3C/svg%3E";
            }}
          />
        ) : (
          <div className="w-10 h-10 bg-blue-200 dark:bg-blue-700 rounded-full flex justify-center items-center">
            <User className="text-blue-600 dark:text-blue-200" size={16} />
          </div>
        )}
      </div>
      <div className="font-medium text-center text-sm break-words w-full">
        {data.label}
      </div>
      
      {data.metadata?.role && (
        <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
          {data.metadata.role}
        </div>
      )}
      
      {renderHandles("w-2 h-2 bg-blue-500 border-2 border-white")}
    </BaseNode>
  );
});

// Place Node with expanded features
const PlaceNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const borderColor = selected ? 'border-green-600' : 'border-green-400';
  
  return (
    <BaseNode 
      className={`rounded-lg bg-green-50 dark:bg-green-900/40 p-3 border-2 ${borderColor} shadow-md h-24 w-24 flex flex-col justify-center items-center`}
      ariaLabel={`Place: ${data.label}`}
    >
      <div className="mb-2 text-green-600 dark:text-green-400">
        <MapPin size={20} />
      </div>
      <div className="font-medium text-center text-sm break-words w-full">
        {data.label}
      </div>
      
      <TruncatedText 
        text={data.description}
        maxLength={30}
        className="text-xs text-gray-600 dark:text-gray-300 mt-1 overflow-hidden text-ellipsis"
      />
      
      {data.metadata?.coordinates && (
        <div className="text-xs text-green-700 dark:text-green-300 mt-1">
          {data.metadata.coordinates}
        </div>
      )}
      
      {renderHandles("w-2 h-2 bg-green-500 border-2 border-white")}
    </BaseNode>
  );
});

// Date Node with improved format
const DateNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const borderColor = selected ? 'border-purple-600' : 'border-purple-400';
  
  // Format date if timestamp is provided
  const displayDate = useMemo(() => {
    if (data.metadata?.timestamp) {
      try {
        const date = new Date(data.metadata.timestamp);
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } catch (e) {
        return data.label;
      }
    }
    return data.label;
  }, [data.label, data.metadata?.timestamp]);
  
  return (
    <BaseNode 
      className={`rounded-lg bg-purple-50 dark:bg-purple-900/40 p-3 border-2 ${borderColor} shadow-md h-16 w-40 flex items-center justify-between`}
      ariaLabel={`Date: ${displayDate}`}
    >
      <Clock className="text-purple-600 dark:text-purple-400 mr-2" size={16} />
      <div className="font-medium text-center text-sm break-words flex-1">
        {displayDate}
      </div>
      
      {renderHandles("w-2 h-2 bg-purple-500 border-2 border-white")}
    </BaseNode>
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
