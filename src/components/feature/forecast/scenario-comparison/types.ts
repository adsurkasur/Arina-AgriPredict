import { ForecastResponse } from '@/types/api';

export interface ScenarioComparisonProps {
  baseForecast: ForecastResponse;
  productId: string;
  onScenarioSelect?: (_scenario: 'optimistic' | 'pessimistic' | 'realistic') => void;
}

export interface Scenario {
  id: 'optimistic' | 'pessimistic' | 'realistic';
  name: string;
  color: string;
  description: string;
}

export interface ScenarioMetric {
  scenario: string;
  avgDemand: number;
  totalRevenue: number;
  confidence: number;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number | undefined;
}

export interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selectedScenarios: string[];
  onScenarioSelect: (_scenarioId: string) => void;
  isLoading?: boolean;
}

export interface SummaryMetricsProps {
  metrics: ScenarioMetric[];
}

export interface ScenarioChartsProps {
  chartData: ChartDataPoint[];
  selectedScenarios: string[];
  scenarios: Scenario[];
}

export interface ScenarioInsightsProps {
  metrics: ScenarioMetric[];
  onScenarioSelect?: (_scenario: 'optimistic' | 'pessimistic' | 'realistic') => void;
}

export interface UseScenarioComparisonResult {
  selectedScenarios: string[];
  comparisonData: ForecastResponse[];
  chartData: ChartDataPoint[];
  summaryMetrics: ScenarioMetric[];
  generateScenarioForecast: (_scenario: 'optimistic' | 'pessimistic' | 'realistic') => Promise<void>;
  isLoading: boolean;
}
