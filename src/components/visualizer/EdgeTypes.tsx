import React, { useMemo, useState } from 'react';
import { 
  getBezierPath, 
  EdgeProps, 
  BaseEdge, 
  EdgeLabelRenderer,
  getSmoothStepPath,
  getMarkerEnd
} from '@xyflow/react';

// Common label component to reduce duplication
const EdgeLabel = ({ 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  label, 
  labelStyle = {},
  labelClassName = "",
  interactive = false
}) => {
  if (!label) return null;
  
  const [isHovered, setIsHovered] = useState(false);
  
  const position = {
    x: (sourceX + targetX) / 2,
    y: (sourceY + targetY) / 2
  };
  
  const baseStyle = {
    position: 'absolute',
    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
    fontSize: 12,
    fontWeight: 500,
    transition: 'all 0.2s ease',
    maxWidth: '150px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    zIndex: isHovered ? 10 : 5
  };
  
  const hoverHandlers = interactive ? {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false)
  } : {};
  
  // If interactive and hovered, expand the label
  const hoverStyle = interactive && isHovered ? {
    maxWidth: '300px',
    whiteSpace: 'normal',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y - 10}px) scale(1.05)`,
  } : {};
  
  return (
    <EdgeLabelRenderer>
      <div
        style={{
          ...baseStyle,
          ...labelStyle,
          ...hoverStyle
        }}
        className={`nodrag nopan edge-label ${labelClassName} ${isHovered ? 'hovered' : ''}`}
        {...hoverHandlers}
        aria-label={typeof label === 'string' ? label : 'Edge label'}
        role={interactive ? 'button' : 'presentation'}
        tabIndex={interactive ? 0 : -1}
      >
        {label}
      </div>
    </EdgeLabelRenderer>
  );
};

// Custom edge with animated dashed line
const DashedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
  animated = true,
  markerEnd: propMarkerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
    curvature: data?.curvature || 0.25
  });
  
  const markerEnd = useMemo(() => {
    return getMarkerEnd(propMarkerEnd, { 
      color: style?.stroke || '#555', 
      strokeWidth: style?.strokeWidth
    });
  }, [propMarkerEnd, style?.stroke, style?.strokeWidth]);
  
  const dashAnimation = animated ? {
    animation: 'dash 15s linear infinite',
    animationDirection: data?.reversed ? 'reverse' : 'normal'
  } : {};
  
  const weight = data?.weight || 1;
  const dashScale = data?.dashScale || 1;
  
  const edgeStyle = {
    ...style,
    strokeDasharray: `${5 * dashScale} ${5 * dashScale}`,
    strokeWidth: Math.max(1, Math.min(3, weight)),
    stroke: selected ? '#3b82f6' : (style?.stroke || '#555'),
    ...dashAnimation
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
        className={`dashed-edge ${selected ? 'selected' : ''}`}
      />
      
      <EdgeLabel 
        sourceX={sourceX}
        sourceY={sourceY}
        targetX={targetX}
        targetY={targetY}
        label={data?.label}
        labelStyle={{
          background: 'white',
          padding: '4px 8px',
          borderRadius: 5,
          border: selected ? '1px solid #3b82f6' : '1px solid #e5e7eb',
        }}
        labelClassName="dashed-edge-label"
        interactive={true}
      />
    </>
  );
};

// Custom edge with glow effect
const GlowingEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
  markerEnd: propMarkerEnd,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: data?.borderRadius || 10
  });

  const intensity = data?.intensity || 1;
  const color = style?.stroke || '#555';
  const selectedColor = '#3b82f6';
  
  // Calculate glow intensity based on data
  const glowColor = selected ? selectedColor : color;
  const glowSize = Math.max(3, Math.min(10, intensity * 5));
  
  const markerEnd = useMemo(() => {
    return getMarkerEnd(propMarkerEnd, { 
      color: selected ? selectedColor : color,
      strokeWidth: style?.strokeWidth
    });
  }, [propMarkerEnd, style?.strokeWidth, color, selected]);

  // Apply proper shadows for glow effect
  const edgeStyle = {
    ...style,
    stroke: selected ? selectedColor : color,
    strokeWidth: Math.max(1.5, style?.strokeWidth || 1.5),
    filter: `drop-shadow(0 0 ${glowSize}px ${glowColor})`,
    transition: 'all 0.3s ease'
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
        className={`glowing-edge ${selected ? 'selected' : ''}`}
      />
      
      <EdgeLabel 
        sourceX={sourceX}
        sourceY={sourceY}
        targetX={targetX}
        targetY={targetY}
        label={data?.label}
        labelStyle={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          padding: '4px 8px',
          borderRadius: 5,
          boxShadow: selected ? `0 0 5px ${glowColor}` : '0 1px 3px rgba(0,0,0,0.1)',
          border: `1px solid ${selected ? selectedColor : 'rgba(0,0,0,0.05)'}`,
        }}
        labelClassName="glowing-edge-label"
        interactive={true}
      />
    </>
  );
};

// Timeline edge - represents chronological connections
const TimelineEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
  markerEnd: propMarkerEnd,
}) => {
  // Timeline edges using orthogonal paths for clearer presentation
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12, // Smoother corners for timeline
  });

  const defaultColor = '#f59e0b';
  const color = style?.stroke || defaultColor;
  const selectedColor = '#e67a00';
  
  const timelinePattern = data?.pattern || 'default';
  let strokeDasharray = '8 4'; // default

  // Different timeline patterns
  switch (timelinePattern) {
    case 'solid':
      strokeDasharray = '';
      break;
    case 'dotted':
      strokeDasharray = '2 4';
      break;
    case 'long-dash':
      strokeDasharray = '12 6';
      break;
    default:
      strokeDasharray = '8 4';
  }

  const markerEnd = useMemo(() => {
    return getMarkerEnd(propMarkerEnd, { 
      color: selected ? selectedColor : color,
      strokeWidth: style?.strokeWidth || 3
    });
  }, [propMarkerEnd, color, selected]);

  const timeSpan = data?.timeSpan;
  const labelContent = timeSpan ? 
    <>
      <span className="timeline-label-text">{data.label}</span>
      <span className="timeline-label-timespan">{timeSpan}</span>
    </> : 
    data.label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 3,
          stroke: selected ? selectedColor : color,
          strokeDasharray,
          transition: 'all 0.2s ease'
        }}
        className={`timeline-edge ${selected ? 'selected' : ''}`}
      />
      
      <EdgeLabel 
        sourceX={sourceX}
        sourceY={sourceY}
        targetX={targetX}
        targetY={targetY}
        label={labelContent}
        labelStyle={{
          background: '#fffbeb',
          border: `1px solid ${selected ? selectedColor : color}`,
          padding: '3px 8px',
          borderRadius: 5,
          fontSize: 11,
          color: '#92400e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        labelClassName="timeline-edge-label"
        interactive={true}
      />
    </>
  );
};

// Bidirectional edge for relationships
const BidirectionalEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
  markerEnd: propMarkerEnd,
  markerStart: propMarkerStart
}) => {
  // Slightly curved path for bidirectional edges
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.2
  });

  const color = style?.stroke || '#6366f1';
  const selectedColor = '#4f46e5';
  
  const markerEnd = useMemo(() => {
    return getMarkerEnd(propMarkerEnd || 'arrow', { 
      color: selected ? selectedColor : color
    });
  }, [propMarkerEnd, color, selected]);
  
  const markerStart = useMemo(() => {
    return getMarkerEnd(propMarkerStart || 'arrow', { 
      color: selected ? selectedColor : color
    });
  }, [propMarkerStart, color, selected]);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          ...style,
          stroke: selected ? selectedColor : color,
          strokeWidth: 1.5,
          transition: 'all 0.2s ease'
        }}
        className={`bidirectional-edge ${selected ? 'selected' : ''}`}
      />
      
      <EdgeLabel 
        sourceX={sourceX}
        sourceY={sourceY}
        targetX={targetX}
        targetY={targetY}
        label={data?.label}
        labelStyle={{
          background: '#eef2ff',
          border: `1px solid ${selected ? selectedColor : color}`,
          padding: '3px 8px',
          borderRadius: 5,
          fontSize: 11,
          color: '#4338ca'
        }}
        labelClassName="bidirectional-edge-label"
        interactive={true}
      />
    </>
  );
};

// Gradient edge for showing transitions or transformations
const GradientEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
  markerEnd: propMarkerEnd
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: data?.curvature || 0.4
  });

  const fromColor = data?.fromColor || '#10b981';
  const toColor = data?.toColor || '#3b82f6';
  const gradientId = `gradient-${id}`;
  
  const markerEnd = useMemo(() => {
    return getMarkerEnd(propMarkerEnd, { 
      color: toColor
    });
  }, [propMarkerEnd, toColor]);

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fromColor} />
          <stop offset="100%" stopColor={toColor} />
        </linearGradient>
      </defs>
      
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: `url(#${gradientId})`,
          strokeWidth: selected ? 3 : (style?.strokeWidth || 2),
          transition: 'all 0.2s ease',
          filter: selected ? 'brightness(1.2)' : 'none'
        }}
        className={`gradient-edge ${selected ? 'selected' : ''}`}
      />
      
      <EdgeLabel 
        sourceX={sourceX}
        sourceY={sourceY}
        targetX={targetX}
        targetY={targetY}
        label={data?.label}
        labelStyle={{
          background: 'linear-gradient(90deg, rgba(240, 253, 244, 1) 0%, rgba(239, 246, 255, 1) 100%)',
          border: selected ? '1px solid #3b82f6' : '1px solid rgba(0,0,0,0.1)',
          padding: '3px 8px',
          borderRadius: 5,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
        labelClassName="gradient-edge-label"
        interactive={true}
      />
    </>
  );
};

// CSS for animations
const EdgeStyles = () => (
  <style jsx global>{`
    @keyframes dash {
      to {
        stroke-dashoffset: 100;
      }
    }
    
    .edge-label.hovered {
      z-index: 10;
    }
    
    .timeline-label-timespan {
      font-size: 9px;
      opacity: 0.8;
      margin-top: 2px;
    }
  `}</style>
);

export const edgeTypes = {
  dashed: DashedEdge,
  glowing: GlowingEdge,
  timeline: TimelineEdge,
  bidirectional: BidirectionalEdge,
  gradient: GradientEdge
};

export { EdgeStyles };
