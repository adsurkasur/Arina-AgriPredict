import { useState, useEffect, useRef, useCallback } from 'react';
import { RealTimeDataPoint, StreamConfig } from './types';

export const useStreamState = () => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  return {
    isStreaming,
    setIsStreaming,
    connectionStatus,
    setConnectionStatus
  };
};

export const useStreamData = (dataRetention: number) => {
  const [streamData, setStreamData] = useState<RealTimeDataPoint[]>([]);

  const addDataPoint = useCallback((newData: RealTimeDataPoint) => {
    setStreamData(prev => {
      const updated = [...prev, newData];
      // Keep only the last N data points for performance
      return updated.slice(-dataRetention);
    });
  }, [dataRetention]);

  return {
    streamData,
    addDataPoint
  };
};

export const useDataGenerator = (config: StreamConfig, streamData: RealTimeDataPoint[]) => {
  return useCallback((): RealTimeDataPoint => {
    const now = new Date();
    const lastData = streamData[streamData.length - 1];

    // Generate realistic data with some randomness
    const demand = lastData
      ? Math.max(0, lastData.demand + (Math.random() - 0.5) * 20)
      : 100 + Math.random() * 50;

    const temperature = 20 + Math.sin(now.getHours() / 24 * Math.PI * 2) * 10 + (Math.random() - 0.5) * 5;
    const humidity = 60 + Math.sin(now.getHours() / 24 * Math.PI * 2) * 20 + (Math.random() - 0.5) * 10;
    const marketPrice = 25 + Math.sin(now.getMinutes() / 60 * Math.PI * 2) * 5 + (Math.random() - 0.5) * 2;
    const competitorActivity = Math.random() * 100;

    // Determine status based on thresholds
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (demand < config.alertThresholds.demand.min || demand > config.alertThresholds.demand.max) {
      status = 'warning';
    }
    if (temperature < config.alertThresholds.temperature.min || temperature > config.alertThresholds.temperature.max) {
      status = 'critical';
    }

    return {
      timestamp: now,
      demand: Math.round(demand),
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity),
      marketPrice: Math.round(marketPrice * 100) / 100,
      competitorActivity: Math.round(competitorActivity),
      status
    };
  }, [config.alertThresholds, streamData]);
};

export const useStreamControls = (
  isStreaming: boolean,
  setIsStreaming: (_value: boolean) => void,
  setConnectionStatus: (_status: 'connected' | 'disconnected' | 'connecting') => void,
  generateData: () => RealTimeDataPoint,
  addDataPoint: (_data: RealTimeDataPoint) => void,
  config: StreamConfig,
  onDataUpdate?: (_data: RealTimeDataPoint) => void
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    setConnectionStatus('connecting');

    // Simulate connection delay
    setTimeout(() => {
      setConnectionStatus('connected');

      // Start data generation interval
      intervalRef.current = setInterval(() => {
        const newData = generateData();
        addDataPoint(newData);
        onDataUpdate?.(newData);
      }, config.updateInterval);
    }, 1000);
  }, [setIsStreaming, setConnectionStatus, generateData, addDataPoint, config.updateInterval, onDataUpdate]);

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    setConnectionStatus('disconnected');

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [setIsStreaming, setConnectionStatus]);

  const toggleStreaming = useCallback(() => {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  }, [isStreaming, startStreaming, stopStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    startStreaming,
    stopStreaming,
    toggleStreaming
  };
};
