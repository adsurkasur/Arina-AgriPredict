import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause } from 'lucide-react';
import { StatisticalAnalysis } from './StatisticalAnalysis';
import { PredictiveModels } from './PredictiveModels';
import { CorrelationAnalysis } from './CorrelationAnalysis';
import { CustomReports } from './CustomReports';
import {
  useStatisticalMetrics,
  usePredictiveModels,
  useCorrelationData,
  useCustomReportConfig,
  useRealTimeToggle
} from './hooks';
import { AdvancedAnalyticsProps, ReportTemplate } from './types';

const reportTemplates: ReportTemplate[] = [
  { name: 'Executive Summary', icon: () => <span>📊</span>, description: 'High-level overview for management' },
  { name: 'Technical Analysis', icon: () => <span>🔬</span>, description: 'Detailed statistical analysis' },
  { name: 'Trend Report', icon: () => <span>📈</span>, description: 'Market trends and forecasting' },
  { name: 'Performance Dashboard', icon: () => <span>📋</span>, description: 'KPI and metrics overview' },
  { name: 'Risk Assessment', icon: () => <span>⚠️</span>, description: 'Risk analysis and mitigation' },
  { name: 'Custom Analysis', icon: () => <span>⚙️</span>, description: 'Build your own report' }
];

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  forecastData,
  historicalData: _historicalData = []
}) => {
  const [selectedModel, setSelectedModel] = useState<string>('arima');
  const { isRealTimeEnabled, toggleRealTime } = useRealTimeToggle();
  const { config, updateConfig } = useCustomReportConfig();

  // Use custom hooks for data processing
  const statisticalMetrics = useStatisticalMetrics(forecastData);
  const predictiveModels = usePredictiveModels();
  const correlationData = useCorrelationData(forecastData);

  // Custom report generation
  const generateCustomReport = () => {
    const reportData = {
      title: config.title || 'Advanced Analytics Report',
      description: config.description,
      generatedAt: new Date().toISOString(),
      metrics: statisticalMetrics,
      models: predictiveModels,
      forecastData: forecastData,
      timeRange: config.timeRange,
      format: config.format
    };

    // In a real implementation, this would generate and download the report
    console.log('Generating custom report:', reportData);
    alert(`Custom report "${reportData.title}" generated successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Real-time Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Predictive modeling and statistical analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isRealTimeEnabled ? "default" : "secondary"}>
            {isRealTimeEnabled ? "Real-time Active" : "Real-time Inactive"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRealTime}
          >
            {isRealTimeEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRealTimeEnabled ? "Pause" : "Start"} Real-time
          </Button>
        </div>
      </div>

      <Tabs defaultValue="statistics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="space-y-4">
          <StatisticalAnalysis
            statisticalMetrics={statisticalMetrics}
            correlationData={correlationData}
          />
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <PredictiveModels
            models={predictiveModels}
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
          />
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <CorrelationAnalysis correlationData={correlationData} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <CustomReports
            config={config}
            onConfigChange={updateConfig}
            onGenerateReport={generateCustomReport}
            templates={reportTemplates}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
