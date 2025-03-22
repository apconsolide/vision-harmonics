
import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import Visualizer from '@/components/visualizer/Visualizer';
import '@xyflow/react/dist/style.css';

const Index = () => {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <ReactFlowProvider>
        <Visualizer />
      </ReactFlowProvider>
    </div>
  );
};

export default Index;
