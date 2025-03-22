
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Edit, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { NodeData } from '@/types/visualizer';

interface NodeDetailsPanelProps {
  node: {
    id: string;
    data: NodeData;
  } | null;
  onClose: () => void;
}

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ node, onClose }) => {
  if (!node) return null;
  
  const { label, description, category, metadata } = node.data;
  
  return (
    <div className="fixed bottom-6 left-6 glass-darker shadow-glass rounded-xl w-72 p-4 z-10 animate-scale-in">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium flex items-center">
          <Badge variant="outline" className="mr-2 capitalize">{category || 'Concept'}</Badge>
          Node Details
        </h3>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-medium">{label}</h2>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        
        <Separator />
        
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium">Metadata</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-muted-foreground">{key}:</span> {value}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Edit</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <LinkIcon className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Connect</span>
          </Button>
          <Button variant="outline" size="sm" className="w-9 px-0">
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsPanel;
