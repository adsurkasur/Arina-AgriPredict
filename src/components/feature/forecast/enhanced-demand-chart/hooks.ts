import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { DemandRecord, ForecastDataPoint } from '@/types/api';
import { ChartDataPoint, UseChartDataResult } from './types';

function aggregateDemandData(
  demandData: DemandRecord[],
  selectedProductIds: string[]
): Record<string, { date: string; actualDemand: number; totalValue: number; count: number }> {
  // Filter demand data by selected products if specified
  const filteredDemandData = selectedProductIds.length > 0
    ? demandData.filter(record => selectedProductIds.includes(record.productId))
    : demandData;

  // Aggregate demand data by date
  return filteredDemandData.reduce((acc, record) => {
    const date = format(parseISO(record.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { date, actualDemand: 0, totalValue: 0, count: 0 };
    }
    acc[date].actualDemand += record.quantity;
    acc[date].totalValue += record.quantity * record.price;
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, { date: string; actualDemand: number; totalValue: number; count: number }>);
}

function processForecastData(forecastData?: ForecastDataPoint[]): Array<{
  date: string;
  forecastDemand: number;
  confidenceLower: number | null;
  confidenceUpper: number | null;
  modelUsed: string | null;
}> {
  return forecastData?.map(point => ({
    date: format(parseISO(point.date), 'yyyy-MM-dd'),
    forecastDemand: point.predictedValue,
    confidenceLower: point.confidenceLower || null,
    confidenceUpper: point.confidenceUpper || null,
    modelUsed: point.modelUsed || null
  })) || [];
}

function mergeChartData(
  demandEntries: Array<{ date: string; actualDemand: number; totalValue: number; count: number }>,
  forecastEntries: Array<{
    date: string;
    forecastDemand: number;
    confidenceLower: number | null;
    confidenceUpper: number | null;
    modelUsed: string | null;
  }>
): ChartDataPoint[] {
  // Merge demand and forecast data
  const allDates = new Set([
    ...demandEntries.map(d => d.date),
    ...forecastEntries.map(f => f.date),
  ]);

  return Array.from(allDates).map(date => {
    const demandEntry = demandEntries.find(d => d.date === date);
    const forecastEntry = forecastEntries.find(f => f.date === date);

    return {
      date,
      actualDemand: demandEntry?.actualDemand || null,
      forecastDemand: forecastEntry?.forecastDemand || null,
      confidenceLower: forecastEntry?.confidenceLower || null,
      confidenceUpper: forecastEntry?.confidenceUpper || null,
      totalValue: demandEntry?.totalValue || null,
      displayDate: format(parseISO(date), 'dd/MM/yyyy'),
      dataPoints: demandEntry?.count || 0,
      modelUsed: forecastEntry?.modelUsed || null
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export function useChartData(
  demandData: DemandRecord[],
  forecastData: ForecastDataPoint[] | undefined,
  selectedProductIds: string[],
  isLoading: boolean
): UseChartDataResult {
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!demandData.length && !forecastData?.length) return [];

    const demandByDate = aggregateDemandData(demandData, selectedProductIds);
    const demandEntries = Object.values(demandByDate);
    const forecastEntries = processForecastData(forecastData);

    return mergeChartData(demandEntries, forecastEntries);
  }, [demandData, forecastData, selectedProductIds]);

  const hasData = chartData.length > 0;

  return {
    chartData,
    isLoading,
    hasData
  };
}

export function useChartMetrics(chartData: ChartDataPoint[]) {
  return useMemo(() => {
    const actualData = chartData.filter(d => d.actualDemand);
    const forecastData = chartData.filter(d => d.forecastDemand);

    const avgActual = actualData.length > 0
      ? actualData.reduce((sum, d) => sum + (d.actualDemand || 0), 0) / actualData.length
      : 0;

    const avgForecast = forecastData.length > 0
      ? forecastData.reduce((sum, d) => sum + (d.forecastDemand || 0), 0) / forecastData.length
      : 0;

    const dataCompleteness = Math.round(
      (chartData.filter(d => d.actualDemand || d.forecastDemand).length / chartData.length) * 100
    );

    const forecastCoverage = Math.round((forecastData.length / chartData.length) * 100);

    return {
      actualPoints: actualData.length,
      forecastPoints: forecastData.length,
      avgActual,
      avgForecast,
      dataCompleteness,
      forecastCoverage,
      latestActual: actualData.slice(-1)[0]?.actualDemand?.toFixed(2) || 'N/A',
      latestForecast: forecastData.slice(-1)[0]?.forecastDemand?.toFixed(2) || 'N/A'
    };
  }, [chartData]);
}
