import { useCallback } from 'react';
import { StreamConfig, RealTimeDataPoint } from './types';
import {
  useStreamState,
  useStreamData,
  useDataGenerator,
  useStreamControls
} from './hooks';

export const useDataStreaming = (
  config: StreamConfig,
  onDataUpdate?: (_data: RealTimeDataPoint) => void
) => {
  const { isStreaming, setIsStreaming, connectionStatus, setConnectionStatus } = useStreamState();
  const { streamData, addDataPoint } = useStreamData(config.dataRetention);
  const generateData = useDataGenerator(config, streamData);
  const { startStreaming, stopStreaming, toggleStreaming } = useStreamControls(
    isStreaming,
    setIsStreaming,
    setConnectionStatus,
    generateData,
    addDataPoint,
    config,
    onDataUpdate
  );

  const getLatestData = useCallback(() => {
    return streamData[streamData.length - 1];
  }, [streamData]);

  const getDataInRange = useCallback((startTime: Date, endTime: Date) => {
    return streamData.filter(point =>
      point.timestamp >= startTime && point.timestamp <= endTime
    );
  }, [streamData]);

  const getAverageValue = useCallback((key: keyof RealTimeDataPoint, count?: number) => {
    const data = count ? streamData.slice(-count) : streamData;
    if (data.length === 0) return 0;

    const sum = data.reduce((acc, point) => {
      const value = point[key];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);

    return sum / data.length;
  }, [streamData]);

  const getStatusCounts = useCallback(() => {
    const counts = { normal: 0, warning: 0, critical: 0 };
    streamData.forEach(point => {
      counts[point.status]++;
    });
    return counts;
  }, [streamData]);

  return {
    // State
    isStreaming,
    connectionStatus,
    streamData,

    // Controls
    startStreaming,
    stopStreaming,
    toggleStreaming,

    // Data access
    getLatestData,
    getDataInRange,
    getAverageValue,
    getStatusCounts
  };
};
