import { useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { useDemands } from '@/hooks/useApiHooks';
import { ForecastResponse } from '@/types/api';
import { WorkspaceHeader } from './WorkspaceHeader';
import { InteractiveDataTable } from '../data-table/InteractiveDataTable';
import { DemandChart } from '../forecast/DemandChart';
import { ForecastControls } from '../forecast/ForecastControls';
import { AIAssistantPanel } from '../ai-assistant/AIAssistantPanel';
import { GripVertical } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export function AgriPredictWorkspace() {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Get all demand data for chart display
  const { data: allDemandsData } = useDemands({ limit: 1000 });

  const handleForecastGenerated = (forecast: ForecastResponse) => {
    setForecastData(forecast);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <WorkspaceHeader />

        {/* Main Content - Resizable Layout */}
        <div className="h-[calc(100vh-200px)]">
          <PanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Data Management */}
            <Panel defaultSize={60} minSize={40} className="pr-3">
              <div className="h-full space-y-6">
                {/* Data Table */}
                <div className="h-2/3" aria-label="Sales Data Table">
                  <ErrorBoundary>
                    <InteractiveDataTable />
                  </ErrorBoundary>
                </div>

                {/* Chart */}
                <div className="h-1/3" aria-label="Demand Forecast Chart">
                  <ErrorBoundary>
                    <DemandChart
                      demandData={allDemandsData?.data || []}
                      forecastData={forecastData?.forecastData}
                      selectedProductId={selectedProductId}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            </Panel>

            {/* Resize Handle */}
            <PanelResizeHandle className="w-2 bg-border hover:bg-primary/20 transition-colors duration-200 rounded-sm flex items-center justify-center">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </PanelResizeHandle>

            {/* Right Panel - AI Assistant & Controls */}
            <Panel defaultSize={40} minSize={30} className="pl-3">
              <div className="h-full space-y-6">
                {/* Forecast Controls */}
                <div className="h-auto" aria-label="Forecast Controls">
                  <ErrorBoundary>
                    <ForecastControls 
                      onForecastGenerated={handleForecastGenerated}
                    />
                  </ErrorBoundary>
                </div>

                {/* AI Assistant */}
                <div className="flex-1 h-0" aria-label="AI Assistant Panel">
                  <ErrorBoundary>
                    <AIAssistantPanel />
                  </ErrorBoundary>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
}