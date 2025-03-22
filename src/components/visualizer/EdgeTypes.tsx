
import React, { FC } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';

// Hierarchical Edge - Solid connection for parent-child relationships
export const HierarchicalEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.2,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: 'hsl(var(--primary))',
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded text-xs backdrop-blur-sm border border-gray-100 dark:border-gray-700"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Network Edge - Dashed connection for related concepts
export const NetworkEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style = {},
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.2,
  });

  return (
    <>
      <path
        id={id}
        className={`react-flow__edge-path ${selected ? 'animated' : ''}`}
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeDasharray: '5, 5',
          strokeWidth: selected ? 2 : 1.5,
          stroke: selected ? 'hsl(var(--primary))' : 'hsl(223, 13%, 65%)',
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded text-xs backdrop-blur-sm border border-gray-100 dark:border-gray-700"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Export the edge types for use with ReactFlow
export const edgeTypes = {
  hierarchical: HierarchicalEdge,
  network: NetworkEdge,
};
