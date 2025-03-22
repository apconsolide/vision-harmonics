
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  ChevronRight, 
  ChevronLeft, 
  Palette, 
  Layout, 
  Settings, 
  Sliders, 
  Eye, 
  Share, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  onLayoutChange: (layout: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onLayoutChange,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleTheme,
  isDarkMode
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [nodeSize, setNodeSize] = useState(50);
  const [edgeThickness, setEdgeThickness] = useState(30);
  const [layout, setLayout] = useState('force');
  
  const handleLayoutChange = (value: string) => {
    setLayout(value);
    onLayoutChange(value);
  };

  return (
    <div 
      className={cn(
        'fixed top-6 right-6 glass-darker shadow-glass rounded-xl transition-all duration-300 ease-elastic z-10',
        isCollapsed ? 'w-12' : 'w-64'
      )}
    >
      <div className="p-2 flex items-center justify-between">
        {!isCollapsed && (
          <h3 className="text-sm font-medium">Control Panel</h3>
        )}
        <Button
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-lg shrink-0 ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      
      {!isCollapsed && (
        <div className="p-3">
          <Tabs defaultValue="layout" className="w-full">
            <TabsList className="w-full grid grid-cols-4 mb-2">
              <TabsTrigger value="layout">
                <Layout className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="style">
                <Palette className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="view">
                <Eye className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="layout" className="space-y-3 mt-2">
              <div className="space-y-2">
                <Label className="text-xs">Layout Type</Label>
                <RadioGroup 
                  defaultValue="force" 
                  value={layout}
                  onValueChange={handleLayoutChange}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="force" id="force" className="h-3 w-3" />
                    <Label htmlFor="force" className="text-xs">Force-Directed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hierarchical" id="hierarchical" className="h-3 w-3" />
                    <Label htmlFor="hierarchical" className="text-xs">Hierarchical</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="radial" id="radial" className="h-3 w-3" />
                    <Label htmlFor="radial" className="text-xs">Radial</Label>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>
            
            <TabsContent value="style" className="space-y-3 mt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Node Size</Label>
                  <span className="text-xs text-muted-foreground">{nodeSize}%</span>
                </div>
                <Slider 
                  value={[nodeSize]} 
                  min={30} 
                  max={100} 
                  step={5}
                  onValueChange={(value) => setNodeSize(value[0])} 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Edge Thickness</Label>
                  <span className="text-xs text-muted-foreground">{edgeThickness}%</span>
                </div>
                <Slider 
                  value={[edgeThickness]} 
                  min={10} 
                  max={100} 
                  step={5}
                  onValueChange={(value) => setEdgeThickness(value[0])} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="view" className="space-y-3 mt-2">
              <div className="flex justify-between gap-2">
                <Button variant="secondary" size="sm" className="flex-1 h-8" onClick={onZoomIn}>
                  <ZoomIn className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Zoom In</span>
                </Button>
                <Button variant="secondary" size="sm" className="flex-1 h-8" onClick={onZoomOut}>
                  <ZoomOut className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Zoom Out</span>
                </Button>
              </div>
              <Button variant="outline" size="sm" className="w-full h-8" onClick={onResetView}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Reset View</span>
              </Button>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-mode" className="text-xs">Dark Mode</Label>
                <Switch id="theme-mode" checked={isDarkMode} onCheckedChange={onToggleTheme} />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-minimap" className="text-xs">Show Minimap</Label>
                <Switch id="show-minimap" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-grid" className="text-xs">Show Grid</Label>
                <Switch id="show-grid" defaultChecked />
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator className="my-3" />
          
          <Button variant="outline" size="sm" className="w-full">
            <Share className="h-3.5 w-3.5 mr-2" />
            <span className="text-xs">Share Visualization</span>
          </Button>
        </div>
      )}
      
      {isCollapsed && (
        <div className="flex flex-col items-center space-y-2 py-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onResetView}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Separator className="w-6" />
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onToggleTheme}>
            {isDarkMode ? 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg> : 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            }
          </Button>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
