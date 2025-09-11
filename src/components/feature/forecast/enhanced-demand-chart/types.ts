import { DemandRecord, ForecastDataPoint } from '@/types/api';

export interface EnhancedDemandChartProps {
  demandData: DemandRecord[];
  forecastData?: ForecastDataPoint[];
  isLoading?: boolean;
  selectedProductIds?: string[];
  showConfidence?: boolean;
}

export interface ChartDataPoint {
  date: string;
  actualDemand: number | null;
  forecastDemand: number | null;
  confidenceLower: number | null;
  confidenceUpper: number | null;
  totalValue: number | null;
  displayDate: string;
  dataPoints: number;
  modelUsed: string | null;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export interface ForecastViewProps {
  chartData: ChartDataPoint[];
  showConfidence: boolean;
  hasForecastData: boolean;
}

export interface ComparisonViewProps {
  chartData: ChartDataPoint[];
}

export interface InsightsViewProps {
  chartData: ChartDataPoint[];
  showConfidence: boolean;
}

export interface LoadingStateProps {
  title?: string;
}

export interface EmptyStateProps {
  title?: string;
  message?: string;
}

export interface UseChartDataResult {
  chartData: ChartDataPoint[];
  isLoading: boolean;
  hasData: boolean;
}
