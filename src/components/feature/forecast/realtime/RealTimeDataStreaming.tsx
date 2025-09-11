import React from 'react';
import { StreamControls } from './StreamControls';
import { MetricsDashboard } from './MetricsDashboard';
import { DataVisualization } from './DataVisualization';
import { useDataStreaming } from './useDataStreaming';
import { StreamConfig } from './types';

interface RealTimeDataStreamingProps {
  forecastData?: any;
  onDataUpdate?: (_data: any) => void;
  config?: Partial<StreamConfig>;
}

const defaultConfig: StreamConfig = {
  updateInterval: 2000,
  dataRetention: 100,
  alertThresholds: {
    demand: { min: 50, max: 200 },
    temperature: { min: 10, max: 35 },
    marketPrice: { min: 20, max: 30 }
  }
};

export const RealTimeDataStreaming: React.FC<RealTimeDataStreamingProps> = ({
  forecastData: _forecastData,
  onDataUpdate: _onDataUpdate,
  config: userConfig
}) => {
  const config = { ...defaultConfig, ...userConfig };
  const {
    isStreaming,
    connectionStatus,
    streamData,
    toggleStreaming,
    getLatestData,
    getAverageValue,
    getStatusCounts
  } = useDataStreaming(config);

  const latestData = getLatestData();
  const averageDemand = getAverageValue('demand', 20);
  const averageTemperature = getAverageValue('temperature', 20);
  const averageHumidity = getAverageValue('humidity', 20);
  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Stream Controls */}
      <StreamControls
        isStreaming={isStreaming}
        connectionStatus={connectionStatus}
        onToggle={toggleStreaming}
      />

      {/* Metrics Dashboard */}
      <MetricsDashboard
        latestData={latestData}
        statusCounts={statusCounts}
        averageDemand={averageDemand}
        averageTemperature={averageTemperature}
        averageHumidity={averageHumidity}
      />

      {/* Data Visualization */}
      <DataVisualization data={streamData} />
    </div>
  );
};
