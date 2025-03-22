
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusCircle, Search, Filter, Download, Share, Maximize } from 'lucide-react';

interface ToolbarProps {
  onAddNode: () => void;
  onToggleSearch: () => void;
  onToggleFilter: () => void;
  onExport: () => void;
  onShare: () => void;
  onFullscreen: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onToggleSearch,
  onToggleFilter,
  onExport,
  onShare,
  onFullscreen
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 glass shadow-glass rounded-full px-3 py-2 z-10 flex items-center space-x-1">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onAddNode}>
              <PlusCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Add Node</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onToggleSearch}>
              <Search className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Search</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onToggleFilter}>
              <Filter className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Filter</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onExport}>
              <Download className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Export</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onShare}>
              <Share className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Share</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onFullscreen}>
              <Maximize className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Fullscreen</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default Toolbar;
