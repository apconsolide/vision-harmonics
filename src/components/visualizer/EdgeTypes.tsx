
import React from 'react';
import { 
  getBezierPath, 
  EdgeProps, 
  BaseEdge, 
  EdgeLabelRenderer,
  getSmoothStepPath
} from '@xyflow/react';

interface EdgeData {
  label?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

// Custom edge with animated dashed line
const DashedEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeDasharray: 5,
          animation: 'dashdraw 0.5s linear infinite',
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${
                (sourceY + targetY) / 2
              }px)`,
              background: 'white',
              padding: '4px 8px',
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 500,
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Custom edge with glow effect
const GlowingEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          filter: 'drop-shadow(0 0 5px currentColor)',
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${
                (sourceY + targetY) / 2
              }px)`,
              background: 'white',
              padding: '4px 8px',
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 500,
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Timeline edge - represents chronological connections
const TimelineEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 3,
          stroke: '#f59e0b',
          strokeDasharray: '8 4',
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${
                (sourceY + targetY) / 2
              }px)`,
              background: '#fffbeb',
              border: '1px solid #f59e0b',
              padding: '2px 6px',
              borderRadius: 5,
              fontSize: 10,
              fontWeight: 500,
            }}
            className="nodrag nopan"
          >
            {data?.label || 'Timeline'}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const edgeTypes = {
  dashed: DashedEdge,
  glowing: GlowingEdge,
  timeline: TimelineEdge
};
