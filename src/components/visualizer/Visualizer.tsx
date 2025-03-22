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
  Edge as FlowEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

import { nodeTypes } from './NodeTypes';
import { edgeTypes } from './EdgeTypes';
import ControlPanel from './ControlPanel';
import NodeDetailsPanel from './NodeDetailsPanel';
import Toolbar from './Toolbar';
import { toast } from '@/components/ui/use-toast';
import { initialNodes, initialEdges } from './initial-elements';
import { NodeData, HistoricalData, HistoricalTextInput } from '@/types/visualizer';
import { supabase } from '@/integrations/supabase/client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, FileText, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

const nodeColor = (node: any) => {
  const data = node.data as NodeData;
  switch (data.entityType) {
    case 'concept':
      return '#4C6EF5';
    case 'document':
      return '#7950F2';
    case 'event':
      return '#f59e0b';
    case 'person':
      return '#3b82f6';
    case 'place':
      return '#10b981';
    case 'date':
      return '#d946ef';
    default:
      switch (data.category) {
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
  }
};

const Visualizer: React.FC = () => {
  // State
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [textInputDialogOpen, setTextInputDialogOpen] = useState(false);
  const [pdfExportDialogOpen, setPdfExportDialogOpen] = useState(false);
  const [pdfExportSettings, setPdfExportSettings] = useState({
    title: '',
    format: 'a4',
    orientation: 'landscape',
    quality: 'high',
    includeMetadata: true,
    includeTimestamp: true,
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [newNodeData, setNewNodeData] = useState<NodeData>({
    label: '',
    category: 'primary',
    size: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalData>({ timelines: [], events: [] });
  const [searchText, setSearchText] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // React Hook Form
  const textInputForm = useForm<HistoricalTextInput>({
    defaultValues: {
      text: '',
      title: '',
      era: '',
      context: '',
    }
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
    (_: React.MouseEvent, node: any) => {
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
        
      case 'timeline':
        // Apply timeline layout
        setNodes((nds) => {
          // Sort nodes by date if available in metadata
          const sortedNodes = [...nds].sort((a, b) => {
            const dataA = a.data as NodeData;
            const dataB = b.data as NodeData;
            const dateA = dataA?.metadata?.date ? new Date(dataA.metadata.date).getTime() : 0;
            const dateB = dataB?.metadata?.date ? new Date(dataB.metadata.date).getTime() : 0;
            return dateA - dateB;
          });
          
          return sortedNodes.map((node, i) => {
            return {
              ...node,
              position: {
                x: 100 + i * 200,
                y: 300 + (i % 2 === 0 ? -100 : 100), // Alternate above and below the line
              },
            };
          });
        });
        
        // Generate timeline connections
        setEdges((eds) => {
          // First remove any existing timeline edges
          const filteredEdges = eds.filter(e => e.type !== 'timeline');
          
          // Get sorted nodes for timeline connections
          const sortedNodes = [...nodes].sort((a, b) => {
            const dataA = a.data as NodeData;
            const dataB = b.data as NodeData;
            const dateA = dataA?.metadata?.date ? new Date(dataA.metadata.date).getTime() : 0;
            const dateB = dataB?.metadata?.date ? new Date(dataB.metadata.date).getTime() : 0;
            return dateA - dateB;
          });
          
          // Create chronological connections
          const timelineEdges: FlowEdge[] = [];
          for (let i = 0; i < sortedNodes.length - 1; i++) {
            timelineEdges.push({
              id: `timeline-${sortedNodes[i].id}-${sortedNodes[i+1].id}`,
              source: sortedNodes[i].id,
              target: sortedNodes[i+1].id,
              type: 'timeline',
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
              data: {
                label: 'chronological'
              }
            });
          }
          
          return [...filteredEdges, ...timelineEdges];
        });
        break;
    }
    
    toast({
      title: "Layout Updated",
      description: `Applied ${layout} layout to the visualization.`,
    });
  }, [edges, nodes, setEdges, setNodes, toast]);
  
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
    
    // Map category to appropriate node type
    let nodeType = 'concept';
    if (['event', 'person', 'document', 'place', 'date'].includes(newNodeData.category)) {
      nodeType = newNodeData.category;
    }
    
    const newNode = {
      id,
      type: nodeType,
      position: {
        x: Math.random() * 800 - 400,
        y: Math.random() * 600 - 300,
      },
      data: {
        ...newNodeData,
        id,
        entityType: nodeType
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
  
  // Export visualization as JSON
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
  
  // Export visualization as high-quality PDF
  const exportVisualizationAsPDF = useCallback(() => {
    setPdfExportDialogOpen(true);
  }, []);
  
  const handlePdfExport = useCallback(async () => {
    if (!reactFlowWrapper.current) return;
    
    setExportLoading(true);
    
    try {
      // First center the view to ensure all elements are visible
      reactFlowInstance.fitView({ padding: 0.2 });
      
      // Wait a bit for the view to adjust
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the react-flow container
      const flowContainer = reactFlowWrapper.current.querySelector('.react-flow');
      if (!flowContainer) throw new Error('Could not find React Flow container');
      
      // Determine quality settings
      const quality = pdfExportSettings.quality === 'high' ? 3 : 
                      pdfExportSettings.quality === 'medium' ? 2 : 1;
      
      // Create high-quality PNG with html-to-image
      const dataUrl = await toPng(flowContainer as HTMLElement, {
        backgroundColor: darkMode ? '#111827' : '#ffffff',
        pixelRatio: quality,
        width: flowContainer.clientWidth * quality,
        height: flowContainer.clientHeight * quality,
        style: {
          // Ensure crisp rendering
          shapeRendering: 'geometricPrecision',
          textRendering: 'optimizeLegibility',
        },
      });
      
      // Create a new PDF document
      const format = pdfExportSettings.format.toUpperCase();
      const orientation = pdfExportSettings.orientation;
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: format,
      });
      
      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add title if specified
      if (pdfExportSettings.title) {
        pdf.setFontSize(16);
        pdf.text(pdfExportSettings.title, 14, 15);
        pdf.setFontSize(10);
      }
      
      // Add metadata if enabled
      if (pdfExportSettings.includeMetadata) {
        const nodeCount = nodes.length;
        const edgeCount = edges.length;
        const metadataY = pdfExportSettings.title ? 25 : 15;
        
        pdf.setFontSize(8);
        pdf.text(`Nodes: ${nodeCount} | Edges: ${edgeCount}`, 14, metadataY);
      }
      
      // Add timestamp if enabled
      if (pdfExportSettings.includeTimestamp) {
        const timestamp = new Date().toLocaleString();
        const timestampY = pdfExportSettings.title && pdfExportSettings.includeMetadata ? 30 : 
                          pdfExportSettings.title || pdfExportSettings.includeMetadata ? 25 : 15;
        
        pdf.setFontSize(8);
        pdf.text(`Generated: ${timestamp}`, 14, timestampY);
      }
      
      // Calculate image placement (accounting for header space)
      const headerSpace = 
        (pdfExportSettings.title ? 15 : 0) + 
        (pdfExportSettings.includeMetadata ? 5 : 0) + 
        (pdfExportSettings.includeTimestamp ? 5 : 0);
      
      const availableHeight = pdfHeight - headerSpace - 10; // 10mm bottom margin
      
      // Load the image
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Calculate image dimensions to fit within available space while maintaining aspect ratio
      const imgRatio = img.width / img.height;
      let imgWidth = pdfWidth - 20; // 10mm margin on each side
      let imgHeight = imgWidth / imgRatio;
      
      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = imgHeight * imgRatio;
      }
      
      // Add image to PDF
      pdf.addImage(
        dataUrl, 
        'PNG', 
        (pdfWidth - imgWidth) / 2, // Center horizontally
        headerSpace + 5, // Position below header
        imgWidth, 
        imgHeight
      );
      
      // Save the PDF
      pdf.save('visualization.pdf');
      
      toast({
        title: "PDF Export Complete",
        description: "Your visualization has been exported as a high-resolution PDF.",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
      setPdfExportDialogOpen(false);
    }
  }, [
    reactFlowInstance, 
    pdfExportSettings, 
    darkMode, 
    nodes.length, 
    edges.length, 
    toast
  ]);
  
  // Search
  const toggleSearch = useCallback(() => {
    setIsSearchOpen(!isSearchOpen);
  }, [isSearchOpen]);
  
  const handleSearch = useCallback((searchTerm: string) => {
    setSearchText(searchTerm);
    
    if (!searchTerm) {
      // If search is cleared, reset node styles
      setNodes(nodes => nodes.map(node => ({
        ...node,
        style: { opacity: 1 }
      })));
      return;
    }
    
    // Highlight nodes that match the search term
    setNodes(nodes => nodes.map(node => {
      const data = node.data as NodeData;
      const matchesSearch = 
        data.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (data.description && data.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return {
        ...node,
        style: { opacity: matchesSearch ? 1 : 0.2 }
      };
    }));
    
    toast({
      title: "Search Results",
      description: `Highlighting nodes matching "${searchTerm}"`,
    });
  }, [setNodes, toast]);
  
  // Open text input form
  const openTextInputForm = useCallback(() => {
    setTextInputDialogOpen(true);
  }, []);
  
  // Process text input
  const processTextInput = useCallback(async (data: HistoricalTextInput) => {
    setLoading(true);
    setTextInputDialogOpen(false);
    
    try {
      // Call the Supabase Edge Function to process the data with Gemini
      const { data: responseData, error } = await supabase.functions.invoke('process-historical-data', {
        body: { 
          timelines: [], 
          events: [],
          userText: data.text
        },
      });
      
      if (error) throw error;
      
      if (responseData && responseData.nodes && responseData.edges) {
        setNodes(responseData.nodes);
        setEdges(responseData.edges);
        
        toast({
          title: "Text Analysis Complete",
          description: "Your historical text has been analyzed and visualized.",
        });
      }
      
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast({
        title: "Error",
        description: "Failed to analyze text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [setEdges, setNodes, toast]);
  
  // Filter
  const toggleFilter = useCallback(() => {
    toast({
      title: "Filter",
      description: "Filter functionality would be implemented here.",
    });
  }, [toast]);
  
  // Share
  const shareVisualization = useCallback(() => {
    toast({
      title: "Share",
      description: "Share functionality would be implemented here.",
    });
  }, [toast]);
  
  // Fetch historical data
  const fetchHistoricalData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Fetch timelines
      const { data: timelines, error: timelinesError } = await supabase
        .from('timelines')
        .select('*');
        
      if (timelinesError) throw timelinesError;
      
      // Fetch timeline events
      const { data: events, error: eventsError } = await supabase
        .from('timeline_events')
        .select('*');
        
      if (eventsError) throw eventsError;
      
      setHistoricalData({ timelines, events });
      
      // Call the Supabase Edge Function to process the data with Gemini
      const { data, error } = await supabase.functions.invoke('process-historical-data', {
        body: { timelines, events },
      });
      
      if (error) throw error;
      
      if (data && data.nodes && data.edges) {
        setNodes(data.nodes);
        setEdges(data.edges);
        
        toast({
          title: "Historical Data Visualized",
          description: "Your historical data has been processed and visualized using Gemini AI.",
        });
      }
      
    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch and process historical data. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to generating a simple historical graph
      generateSimpleHistoricalGraph();
    } finally {
      setLoading(false);
    }
  }, [setEdges, setNodes, toast]);
  
  // Generate simple historical graph from available data
  const generateSimpleHistoricalGraph = useCallback(() => {
    try {
      // Create nodes and edges from timeline data
      if (!historicalData.events) return;
      
      const generatedNodes: Node[] = [];
      const generatedEdges: FlowEdge[] = [];
      
      // Create timeline nodes
      if (historicalData.timelines) {
        historicalData.timelines.forEach((timeline: any, index: number) => {
          generatedNodes.push({
            id: `timeline-${timeline.id}`,
            type: 'concept',
            position: { x: 100, y: 100 + index * 200 },
            data: {
              id: `timeline-${timeline.id}`,
              label: timeline.title || 'Timeline',
              description: timeline.description || '',
              category: 'primary',
              size: 'large'
            }
          });
        });
      }
      
      // Create event nodes
      historicalData.events.forEach((event: any, index: number) => {
        const eventDate = event.date ? new Date(event.date) : null;
        const formattedDate = eventDate ? eventDate.toLocaleDateString() : '';
        
        generatedNodes.push({
          id: `event-${event.id}`,
          type: 'event',
          position: { x: 400 + (index % 3) * 200, y: 100 + Math.floor(index / 3) * 150 },
          data: {
            id: `event-${event.id}`,
            label: event.title || 'Event',
            description: event.description || '',
            category: 'event',
            size: 'medium',
            metadata: {
              date: formattedDate,
              category: event.category || 'historical'
            }
          }
        });
        
        // Connect events to their timelines
        if (event.timeline_id) {
          generatedEdges.push({
            id: `edge-timeline-${event.timeline_id}-event-${event.id}`,
            source: `timeline-${event.timeline_id}`,
            target: `event-${event.id}`,
            type: 'timeline',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed
            },
            data: {
              label: 'contains'
            }
          });
        }
      });
      
      // Connect events chronologically within the same timeline
      const eventsByTimeline: Record<string, any[]> = {};
      
      historicalData.events.forEach((event: any) => {
        if (!event.timeline_id) return;
        
        if (!eventsByTimeline[event.timeline_id]) {
          eventsByTimeline[event.timeline_id] = [];
        }
        
        eventsByTimeline[event.timeline_id].push(event);
      });
      
      // Sort events by date and create chronological connections
      Object.values(eventsByTimeline).forEach((timelineEvents) => {
        timelineEvents.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateA - dateB;
        });
        
        for (let i = 0; i < timelineEvents.length - 1; i++) {
          generatedEdges.push({
            id: `edge-chrono-${timelineEvents[i].id}-${timelineEvents[i+1].id}`,
            source: `event-${timelineEvents[i].id}`,
            target: `event-${timelineEvents[i+1].id}`,
            type: 'dashed',
            animated: true,
            data: {
              label: 'followed by'
            }
          });
        }
      });
      
      if (generatedNodes.length > 0) {
        setNodes(generatedNodes);
        setEdges(generatedEdges);
        
        toast({
          title: "Historical Data Visualized",
          description: "Your historical timeline data has been visualized.",
        });
        
        // Apply timeline layout
        setTimeout(() => {
          changeLayout('timeline');
        }, 500);
      }
    } catch (error) {
      console.error('Error generating simple historical graph:', error);
    }
  }, [historicalData, setNodes, setEdges, toast, changeLayout]);
  
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
        
        {/* Search Panel */}
        {isSearchOpen && (
          <Panel position="top-center" className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-md shadow-md w-full max-w-md">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search nodes..."
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" variant="ghost" onClick={() => {
                setSearchText('');
                handleSearch('');
              }}>
                Clear
              </Button>
            </div>
          </Panel>
        )}
        
        {/* PDF Export Button */}
        <Panel position="top-right" className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-md shadow-md">
          <Button 
            onClick={exportVisualizationAsPDF}
            className="flex items-center space-x-1"
            size="sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Download PDF
          </Button>
        </Panel>
        
        {/* History Input Panel */}
        <Panel position="top-left" className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-md shadow-md">
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium">Historical Analysis</h3>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={fetchHistoricalData}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Use Database Data'
                )}
              </Button>
              
              <Button
                size="sm"
                onClick={openTextInputForm}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                
                <FileText className="mr-2 h-4 w-4" />
                Input Text
              </Button>
            </div>
          </div>
        </Panel>
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
      
      {/* New Node Dialog */}
      <Dialog open={nodeDialogOpen} onOpenChange={setNodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Node</DialogTitle>
            <DialogDescription>
              Add a new entity to your visualization.
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
                <Label htmlFor="node-category">Entity Type</Label>
                <Select 
                  value={newNodeData.category}
                  onValueChange={(value) => setNewNodeData({ ...newNodeData, category: value })}
                >
                  <SelectTrigger id="node-category">
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concept">Concept</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="person">Person</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="place">Place</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="tertiary">Tertiary</SelectItem>
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
            
            {(newNodeData.category === 'event' || newNodeData.category === 'date') && (
              <div className="space-y-2">
                <Label htmlFor="node-date">Date (Optional)</Label>
                <Input 
                  id="node-date"
                  type="date"
                  onChange={(e) => setNewNodeData({
                    ...newNodeData,
                    metadata: {
                      ...newNodeData.metadata,
                      date: e.target.value
                    }
                  })}
                  placeholder="Select date"
                />
              </div>
            )}
            
            {newNodeData.category === 'place' && (
              <div className="space-y-2">
                <Label htmlFor="node-location">Location (Optional)</Label>
                <Input 
                  id="node-location"
                  onChange={(e) => setNewNodeData({
                    ...newNodeData,
                    metadata: {
                      ...newNodeData.metadata,
                      location: e.target.value
                    }
                  })}
                  placeholder="Enter location details"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setNodeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateNode} disabled={!newNodeData.label}>Create Node</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Text Input Dialog */}
      <Dialog open={textInputDialogOpen} onOpenChange={setTextInputDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Input Historical Text</DialogTitle>
            <DialogDescription>
              Paste or type historical text to visualize key entities and relationships.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...textInputForm}>
            <form onSubmit={textInputForm.handleSubmit(processTextInput)} className="space-y-4 py-4">
              <FormField
                control={textInputForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., World War II Overview" {...field} />
                    </FormControl>
                    <FormDescription>
                      A title for your historical text.
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={textInputForm.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Paste or type historical text here..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Text will be analyzed to identify entities, events, people, and relationships.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={textInputForm.control}
                  name="era"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Historical Era (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 20th Century, Medieval" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={textInputForm.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Context (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Military History, Cultural Revolution" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setTextInputDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!textInputForm.getValues().text.trim() || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Analyze & Visualize'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Visualizer;
