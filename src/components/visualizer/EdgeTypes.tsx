
import React from 'react';
import { 
  getBezierPath, 
  EdgeProps, 
  BaseEdge, 
  EdgeLabelRenderer,
  getSmoothStepPath
} from '@xyflow/react';

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

export const edgeTypes = {
  dashed: DashedEdge,
  glowing: GlowingEdge,
};
