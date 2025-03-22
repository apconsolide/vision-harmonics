import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ReactFlow, 
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
  useReactFlow,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './NodeTypes';
import { edgeTypes } from './EdgeTypes';
import ControlPanel from './ControlPanel';
import NodeDetailsPanel from './NodeDetailsPanel';
import Toolbar from './Toolbar';
import { toast } from '@/components/ui/use-toast';
import { initialNodes, initialEdges } from './initial-elements';
import { NodeData } from '@/types/visualizer';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const nodeColor = (node: Node) => {
  switch (node.data.category) {
    case 'primary':
      return '#4C6EF5';
    case 'secondary':
      return '#5CBBF6';
    case 'tertiary':
      return '#7950F2';
    case 'quaternary':
      return '#F783AC';
    case 'success':
      return '#40C057';
    case 'warning':
      return '#FAAE42';
    case 'danger':
      return '#FA5252';
    case 'info':
      return '#22B8CF';
    default:
      return '#E9ECEF';
  }
};

const Visualizer: React.FC = () => {
  // State
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [newNodeData, setNewNodeData] = useState<NodeData>({
    label: '',
    category: 'primary',
    size: 'medium',
  });
  
  // ReactFlow utils
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Toggle theme
  const toggleTheme = useCallback(() => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setDarkMode(!darkMode);
  }, [darkMode]);
  
  // Handle node selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    []
  );
  
  // Close node details panel
  const closeNodeDetails = useCallback(() => {
    setSelectedNode(null);
  }, []);
  
  // Layout algorithms
  const changeLayout = useCallback((layout: string) => {
    switch (layout) {
      case 'force':
        // Apply force-directed layout
        setNodes((nds) =>
          nds.map((node) => ({
            ...node,
            position: {
              x: Math.random() * 800,
              y: Math.random() * 600,
            },
          }))
        );
        break;
        
      case 'hierarchical':
        // Apply hierarchical layout
        setNodes((nds) => {
          const rootNodes = nds.filter((n) => !edges.some((e) => e.target === n.id));
          const processed = new Set<string>();
          const nodePositions: Record<string, { x: number, y: number }> = {};
          
          // Process hierarchical positions
          const processNode = (nodeId: string, level: number, position: number, totalPositions: number) => {
            if (processed.has(nodeId)) return;
            processed.add(nodeId);
            
            // Calculate horizontal position
            const xPos = (position / totalPositions) * 1000;
            const yPos = level * 200;
            
            nodePositions[nodeId] = { x: xPos, y: yPos };
            
            // Process children
            const children = edges
              .filter((e) => e.source === nodeId)
              .map((e) => e.target);
            
            if (children.length > 0) {
              const step = 1 / children.length;
              children.forEach((childId, idx) => {
                const childPos = position + step * (idx + 0.5) / totalPositions;
                processNode(childId, level + 1, childPos * totalPositions, totalPositions);
              });
            }
          };
          
          // Start processing from root nodes
          rootNodes.forEach((node, i) => {
            processNode(node.id, 0, i, rootNodes.length);
          });
          
          // Update node positions
          return nds.map((node) => ({
            ...node,
            position: nodePositions[node.id] || node.position,
          }));
        });
        break;
        
      case 'radial':
        // Apply radial layout
        setNodes((nds) => {
          const center = { x: 500, y: 400 };
          const radius = 300;
          const angleStep = (2 * Math.PI) / nds.length;
          
          return nds.map((node, i) => {
            const angle = i * angleStep;
            return {
              ...node,
              position: {
                x: center.x + radius * Math.cos(angle),
                y: center.y + radius * Math.sin(angle),
              },
            };
          });
        });
        break;
    }
    
    toast({
      title: "Layout Updated",
      description: `Applied ${layout} layout to the visualization.`,
    });
  }, [edges, setNodes, toast]);
  
  // Zoom controls
  const zoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);
  
  const zoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);
  
  const resetView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2 });
    toast({
      title: "View Reset",
      description: "Visualization has been centered and zoomed to fit all elements.",
    });
  }, [reactFlowInstance, toast]);
  
  // Add new node
  const addNode = useCallback(() => {
    setNodeDialogOpen(true);
  }, []);
  
  const handleCreateNode = useCallback(() => {
    const id = `node-${nodes.length + 1}`;
    const newNode = {
      id,
      type: 'concept',
      position: {
        x: Math.random() * 800 - 400,
        y: Math.random() * 600 - 300,
      },
      data: {
        ...newNodeData,
        id
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    setNodeDialogOpen(false);
    setNewNodeData({
      label: '',
      category: 'primary',
      size: 'medium',
    });
    
    toast({
      title: "Node Created",
      description: `Created new node "${newNodeData.label}"`,
    });
  }, [newNodeData, nodes.length, setNodes, toast]);
  
  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      toast({
        title: "Fullscreen Mode",
        description: "Press ESC to exit fullscreen.",
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [toast]);
  
  // Export visualization
  const exportVisualization = useCallback(() => {
    const dataStr = JSON.stringify({ nodes, edges });
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'visualization.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Visualization Exported",
      description: "Your visualization has been exported as JSON.",
    });
  }, [nodes, edges, toast]);
  
  // Mock functions for toolbar actions
  const toggleSearch = useCallback(() => {
    toast({
      title: "Search",
      description: "Search functionality would be implemented here.",
    });
  }, [toast]);
  
  const toggleFilter = useCallback(() => {
    toast({
      title: "Filter",
      description: "Filter functionality would be implemented here.",
    });
  }, [toast]);
  
  const shareVisualization = useCallback(() => {
    toast({
      title: "Share",
      description: "Share functionality would be implemented here.",
    });
  }, [toast]);
  
  // Apply dark mode on component mount if needed
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [darkMode]);
  
  // Center the view on mount
  useEffect(() => {
    setTimeout(() => {
      resetView();
    }, 100);
  }, [resetView]);
  
  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Controls 
          position="bottom-right" 
          showInteractive={false}
          className="m-2"
        />
        <MiniMap 
          nodeColor={nodeColor}
          maskColor="rgba(255, 255, 255, 0.1)"
          className="m-2"
        />
        <Background
          color={darkMode ? "#444444" : "#e0e0e0"}
          gap={20}
          size={1}
          style={{ backgroundColor: darkMode ? "#111827" : "#f8fafc" }}
        />
      </ReactFlow>
      
      <ControlPanel
        onLayoutChange={changeLayout}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        onToggleTheme={toggleTheme}
        isDarkMode={darkMode}
      />
      
      {selectedNode && (
        <NodeDetailsPanel
          node={selectedNode as { id: string; data: NodeData }}
          onClose={closeNodeDetails}
        />
      )}
      
      <Toolbar
        onAddNode={addNode}
        onToggleSearch={toggleSearch}
        onToggleFilter={toggleFilter}
        onExport={exportVisualization}
        onShare={shareVisualization}
        onFullscreen={toggleFullscreen}
      />
      
      <Dialog open={nodeDialogOpen} onOpenChange={setNodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Node</DialogTitle>
            <DialogDescription>
              Add a new concept to your visualization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="node-label">Node Label</Label>
              <Input 
                id="node-label"
                value={newNodeData.label}
                onChange={(e) => setNewNodeData({ ...newNodeData, label: e.target.value })}
                placeholder="Enter node label"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="node-description">Description (Optional)</Label>
              <Input 
                id="node-description"
                value={newNodeData.description || ''}
                onChange={(e) => setNewNodeData({ ...newNodeData, description: e.target.value })}
                placeholder="Enter node description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="node-category">Category</Label>
                <Select 
                  value={newNodeData.category}
                  onValueChange={(value) => setNewNodeData({ ...newNodeData, category: value })}
                >
                  <SelectTrigger id="node-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="tertiary">Tertiary</SelectItem>
                    <SelectItem value="quaternary">Quaternary</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="danger">Danger</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="node-size">Size</Label>
                <Select 
                  value={newNodeData.size}
                  onValueChange={(value: any) => setNewNodeData({ ...newNodeData, size: value })}
                >
                  <SelectTrigger id="node-size">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setNodeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateNode} disabled={!newNodeData.label}>Create Node</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Visualizer;
