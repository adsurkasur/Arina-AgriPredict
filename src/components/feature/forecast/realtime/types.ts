export interface RealTimeDataPoint {
  timestamp: Date;
  demand: number;
  temperature: number;
  humidity: number;
  marketPrice: number;
  competitorActivity: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface StreamConfig {
  updateInterval: number;
  dataRetention: number;
  alertThresholds: {
    demand: { min: number; max: number };
    temperature: { min: number; max: number };
    marketPrice: { min: number; max: number };
  };
}

export interface RealTimeDataStreamingProps {
  forecastData?: any;
  onDataUpdate?: (_data: RealTimeDataPoint) => void;
}

export interface StreamControlsProps {
  isStreaming: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  onToggleStreaming: () => void;
}

export interface MetricsDashboardProps {
  currentData?: RealTimeDataPoint;
  demandTrend: number;
  temperatureTrend: number;
  priceTrend: number;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  trendColor: string;
  subtitle?: string;
}

export interface DataVisualizationProps {
  data: RealTimeDataPoint[];
  maxDataPoints: number;
}

export interface StreamConfigPanelProps {
  config: StreamConfig;
  onConfigChange: (_config: StreamConfig) => void;
  isStreaming: boolean;
}

export interface AlertSystemProps {
  alerts: Array<{
    id: string;
    type: 'warning' | 'critical';
    message: string;
    timestamp: Date;
  }>;
  onDismissAlert: (_id: string) => void;
}

export interface TrendData {
  value: number;
  trend: number;
  status: 'normal' | 'warning' | 'critical';
}
