import { ForecastResponse } from '@/types/api';

export interface StatisticalMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PredictiveModel {
  id: string;
  name: string;
  accuracy: number;
  confidence: number;
  parameters: Record<string, any>;
  lastTrained: string;
}

export interface CorrelationDataPoint {
  date: string;
  demand: number;
  confidence: number;
  revenue: number;
}

export interface CustomReportConfig {
  title: string;
  description: string;
  metrics: string[];
  timeRange: string;
  format: string;
}

export interface AdvancedAnalyticsProps {
  forecastData: ForecastResponse;
  historicalData?: any[];
}

export interface MetricCardProps {
  metric: StatisticalMetric;
}

export interface ModelCardProps {
  model: PredictiveModel;
  isSelected: boolean;
  onSelect: (_modelId: string) => void;
}

export interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  height?: number;
}

export interface ReportTemplate {
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

export interface StatisticalAnalysisProps {
  statisticalMetrics: StatisticalMetric[];
  correlationData: CorrelationDataPoint[];
}

export interface PredictiveModelsProps {
  models: PredictiveModel[];
  selectedModel: string;
  onModelSelect: (_modelId: string) => void;
}

export interface CorrelationAnalysisProps {
  correlationData: CorrelationDataPoint[];
}

export interface CustomReportsProps {
  config: CustomReportConfig;
  onConfigChange: (config: CustomReportConfig) => void;
  onGenerateReport: () => void;
  templates: ReportTemplate[];
}
