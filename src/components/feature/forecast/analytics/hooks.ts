import { useState, useMemo } from 'react';
import { ForecastResponse } from '@/types/api';
import { StatisticalMetric, PredictiveModel, CustomReportConfig } from './types';

export const useStatisticalMetrics = (forecastData: ForecastResponse) => {
  return useMemo((): StatisticalMetric[] => {
    if (!forecastData.forecastData.length) return [];

    const values = forecastData.forecastData.map(d => d.predictedValue);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    const trend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    return [
      {
        name: 'Mean Demand',
        value: Math.round(mean),
        unit: 'units',
        change: trend,
        trend: trend > 5 ? 'up' : trend < -5 ? 'down' : 'stable'
      },
      {
        name: 'Standard Deviation',
        value: Math.round(stdDev),
        unit: 'units',
        change: 0,
        trend: 'stable'
      },
      {
        name: 'Coefficient of Variation',
        value: Math.round((stdDev / mean) * 100),
        unit: '%',
        change: 0,
        trend: 'stable'
      },
      {
        name: 'Peak Demand',
        value: Math.max(...values),
        unit: 'units',
        change: trend,
        trend: trend > 5 ? 'up' : trend < -5 ? 'down' : 'stable'
      }
    ];
  }, [forecastData]);
};

export const usePredictiveModels = () => {
  return useMemo((): PredictiveModel[] => [
    {
      id: 'arima',
      name: 'ARIMA (AutoRegressive Integrated Moving Average)',
      accuracy: 87.5,
      confidence: 0.85,
      parameters: { p: 2, d: 1, q: 2 },
      lastTrained: '2024-01-15T10:30:00Z'
    },
    {
      id: 'prophet',
      name: 'Facebook Prophet',
      accuracy: 89.2,
      confidence: 0.87,
      parameters: { seasonality: 'additive', holidays: true },
      lastTrained: '2024-01-15T10:30:00Z'
    },
    {
      id: 'xgboost',
      name: 'XGBoost Regression',
      accuracy: 91.8,
      confidence: 0.89,
      parameters: { maxDepth: 6, learningRate: 0.1, nEstimators: 100 },
      lastTrained: '2024-01-15T10:30:00Z'
    },
    {
      id: 'neural_network',
      name: 'Neural Network (LSTM)',
      accuracy: 93.1,
      confidence: 0.91,
      parameters: { layers: 3, neurons: 64, epochs: 100 },
      lastTrained: '2024-01-15T10:30:00Z'
    }
  ], []);
};

export const useCorrelationData = (forecastData: ForecastResponse) => {
  return useMemo(() => {
    if (!forecastData.forecastData.length) return [];

    return forecastData.forecastData.map((point, index) => ({
      date: new Date(point.date).toLocaleDateString('en-GB'),
      demand: point.predictedValue,
      confidence: (point.confidenceUpper && point.confidenceLower) ? (point.confidenceUpper - point.confidenceLower) / 2 : 0,
      revenue: forecastData.revenueProjection?.[index]?.projectedRevenue || 0
    }));
  }, [forecastData]);
};

export const useCustomReportConfig = () => {
  const [config, setConfig] = useState<CustomReportConfig>({
    title: '',
    description: '',
    metrics: [],
    timeRange: '30d',
    format: 'pdf'
  });

  const updateConfig = (updates: Partial<CustomReportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return { config, updateConfig };
};

export const useRealTimeToggle = () => {
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState<boolean>(false);

  const toggleRealTime = () => {
    setIsRealTimeEnabled(prev => !prev);
  };

  return { isRealTimeEnabled, toggleRealTime };
};
