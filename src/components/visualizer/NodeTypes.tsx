
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

// Concept Node - Main visualization node
export const ConceptNode = memo(({ data, selected, id }: NodeProps) => {
  const { label, category, size = 'medium', importance = 1 } = data;
  
  // Size mapping
  const sizeMap = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-40 h-40',
  };
  
  // Importance affects opacity
  const opacityClass = importance < 1 ? 'opacity-70' : 'opacity-100';
  
  // Category color mapping
  const categoryColorMap: Record<string, string> = {
    primary: 'bg-node-primary text-white',
    secondary: 'bg-node-secondary text-white',
    tertiary: 'bg-node-tertiary text-white',
    quaternary: 'bg-node-quaternary text-white',
    success: 'bg-node-success text-white',
    warning: 'bg-node-warning text-white',
    danger: 'bg-node-danger text-white',
    info: 'bg-node-info text-white',
    default: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
  };
  
  const colorClass = categoryColorMap[category || 'default'];
  const nodeSize = sizeMap[size as keyof typeof sizeMap] || sizeMap.medium;
  
  return (
    <div 
      className={cn(
        'flex items-center justify-center rounded-2xl',
        nodeSize,
        colorClass, 
        opacityClass,
        'shadow-node hover:shadow-node-hover transition-all duration-300',
        'backdrop-blur-sm backdrop-saturate-150',
        selected && 'shadow-node-selected ring-2 ring-primary animate-pulse-subtle',
        'font-medium'
      )}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800" />
      
      <div className="text-center p-2">
        <div className="node-text-bg">
          <span className="text-sm font-medium">{label}</span>
        </div>
        {data.description && (
          <div className="mt-2 text-xs max-w-[90%] mx-auto opacity-80 node-text-bg">
            {data.description}
          </div>
        )}
      </div>
    </div>
  );
});

// Sub-concept Node - Smaller node for hierarchical concepts
export const SubConceptNode = memo(({ data, selected }: NodeProps) => {
  const { label, category } = data;
  
  // Category color mapping with reduced opacity
  const categoryColorMap: Record<string, string> = {
    primary: 'bg-node-primary/80 text-white',
    secondary: 'bg-node-secondary/80 text-white',
    tertiary: 'bg-node-tertiary/80 text-white',
    quaternary: 'bg-node-quaternary/80 text-white',
    success: 'bg-node-success/80 text-white',
    warning: 'bg-node-warning/80 text-white',
    danger: 'bg-node-danger/80 text-white',
    info: 'bg-node-info/80 text-white',
    default: 'bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100',
  };
  
  const colorClass = categoryColorMap[category || 'default'];
  
  return (
    <div 
      className={cn(
        'flex items-center justify-center rounded-xl w-24 h-24',
        colorClass,
        'shadow-node hover:shadow-node-hover transition-all duration-300',
        'backdrop-blur-sm backdrop-saturate-150',
        selected && 'shadow-node-selected ring-2 ring-primary animate-pulse-subtle',
        'font-medium'
      )}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800" />
      
      <div className="text-center p-2">
        <div className="node-text-bg">
          <span className="text-xs font-medium">{label}</span>
        </div>
      </div>
    </div>
  );
});

// GroupNode - Container for related nodes
export const GroupNode = memo(({ data }: NodeProps) => {
  const { label } = data;
  
  return (
    <div className="flex flex-col rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm min-w-[180px] min-h-[180px] p-1">
      <div className="text-xs font-medium p-1 text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-900/70 rounded mx-1 mt-1 backdrop-blur-sm text-center">
        {label}
      </div>
    </div>
  );
});

// Export the node types for use with ReactFlow
export const nodeTypes = {
  concept: ConceptNode,
  subConcept: SubConceptNode,
  group: GroupNode,
};
