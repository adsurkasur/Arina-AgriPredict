import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ForecastResponse, ForecastRequest } from '@/types/api';
import { useForecast } from '@/hooks/useApiHooks';
import { Scenario, ScenarioMetric, ChartDataPoint, UseScenarioComparisonResult } from './types';

const SCENARIOS: Scenario[] = [
  { id: 'optimistic', name: 'Optimistic', color: '#10b981', description: 'Best case scenario' },
  { id: 'realistic', name: 'Realistic', color: '#3b82f6', description: 'Balanced scenario' },
  { id: 'pessimistic', name: 'Pessimistic', color: '#ef4444', description: 'Worst case scenario' }
];

function createForecastRequest(
  baseForecast: ForecastResponse,
  productId: string,
  scenario: 'optimistic' | 'pessimistic' | 'realistic'
): ForecastRequest {
  return {
    productId,
    days: baseForecast.metadata?.forecastHorizon || 14,
    sellingPrice: baseForecast.revenueProjection?.[0]?.sellingPrice,
    models: baseForecast.modelsUsed,
    includeConfidence: true,
    scenario
  };
}

function processChartData(
  comparisonData: ForecastResponse[],
  selectedScenarios: string[]
): ChartDataPoint[] {
  if (!comparisonData.length) return [];

  const baseData = comparisonData[0];
  const dates = baseData.forecastData.map(d => format(parseISO(d.date), 'dd/MM/yyyy'));

  return dates.map((date, index) => {
    const dataPoint: ChartDataPoint = { date };

    comparisonData.forEach((forecast, forecastIndex) => {
      const scenario = selectedScenarios[forecastIndex] || 'realistic';
      const forecastPoint = forecast.forecastData[index];

      if (forecastPoint) {
        dataPoint[`${scenario}_demand`] = forecastPoint.predictedValue;
        dataPoint[`${scenario}_lower`] = forecastPoint.confidenceLower;
        dataPoint[`${scenario}_upper`] = forecastPoint.confidenceUpper;

        const revenuePoint = forecast.revenueProjection?.[index];
        if (revenuePoint) {
          dataPoint[`${scenario}_revenue`] = revenuePoint.projectedRevenue;
        }
      }
    });

    return dataPoint;
  });
}

function calculateSummaryMetrics(
  comparisonData: ForecastResponse[],
  selectedScenarios: string[]
): ScenarioMetric[] {
  return comparisonData.map((forecast, index) => {
    const scenario = selectedScenarios[index] || 'realistic';
    const avgDemand = forecast.forecastData.reduce((sum, d) => sum + d.predictedValue, 0) / forecast.forecastData.length;
    const totalRevenue = forecast.revenueProjection?.reduce((sum, r) => sum + r.projectedRevenue, 0) || 0;
    const confidence = forecast.confidence || 0;

    return {
      scenario,
      avgDemand: Math.round(avgDemand),
      totalRevenue,
      confidence: Math.round(confidence * 100)
    };
  });
}

export function useScenarioComparison(
  baseForecast: ForecastResponse,
  productId: string
): UseScenarioComparisonResult {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['realistic']);
  const [comparisonData, setComparisonData] = useState<ForecastResponse[]>([baseForecast]);
  const forecastMutation = useForecast();

  const generateScenarioForecast = async (scenario: 'optimistic' | 'pessimistic' | 'realistic') => {
    if (selectedScenarios.includes(scenario)) return;

    const request = createForecastRequest(baseForecast, productId, scenario);

    try {
      const result = await forecastMutation.mutateAsync(request);
      setComparisonData(prev => [...prev, result]);
      setSelectedScenarios(prev => [...prev, scenario]);
    } catch (error) {
      console.error('Failed to generate scenario forecast:', error);
    }
  };

  const chartData = useMemo(() =>
    processChartData(comparisonData, selectedScenarios),
    [comparisonData, selectedScenarios]
  );

  const summaryMetrics = useMemo(() =>
    calculateSummaryMetrics(comparisonData, selectedScenarios),
    [comparisonData, selectedScenarios]
  );

  return {
    selectedScenarios,
    comparisonData,
    chartData,
    summaryMetrics,
    generateScenarioForecast,
    isLoading: forecastMutation.isPending,
  };
}

export function useScenarios(): Scenario[] {
  return SCENARIOS;
}

export function useScenarioInsights(metrics: ScenarioMetric[]) {
  const revenueRange = useMemo(() => {
    if (metrics.length === 0) return null;
    const revenues = metrics.map(m => m.totalRevenue);
    return {
      min: Math.min(...revenues),
      max: Math.max(...revenues)
    };
  }, [metrics]);

  const bestVsWorstDifference = useMemo(() => {
    if (metrics.length < 3) return null;

    const optimistic = metrics.find(m => m.scenario === 'optimistic')?.totalRevenue || 0;
    const pessimistic = metrics.find(m => m.scenario === 'pessimistic')?.totalRevenue || 1;

    return Math.round(((optimistic / pessimistic) - 1) * 100);
  }, [metrics]);

  const recommendedScenario = useMemo(() => {
    if (metrics.length === 0) return null;
    return metrics.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
  }, [metrics]);

  return {
    revenueRange,
    bestVsWorstDifference,
    recommendedScenario
  };
}
