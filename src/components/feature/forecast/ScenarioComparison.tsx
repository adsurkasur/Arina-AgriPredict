"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ForecastResponse, ForecastRequest } from '@/types/api';
import { useForecast } from '@/hooks/useApiHooks';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';

interface ScenarioComparisonProps {
  baseForecast: ForecastResponse;
  productId: string;
  onScenarioSelect?: (_scenario: 'optimistic' | 'pessimistic' | 'realistic') => void;
}

export function ScenarioComparison({
  baseForecast,
  productId,
  onScenarioSelect
}: ScenarioComparisonProps) {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['realistic']);
  const [comparisonData, setComparisonData] = useState<ForecastResponse[]>([baseForecast]);

  const forecastMutation = useForecast();

  const scenarios = [
    { id: 'optimistic', name: 'Optimistic', color: '#10b981', description: 'Best case scenario' },
    { id: 'realistic', name: 'Realistic', color: '#3b82f6', description: 'Balanced scenario' },
    { id: 'pessimistic', name: 'Pessimistic', color: '#ef4444', description: 'Worst case scenario' }
  ];

  const generateScenarioForecast = async (scenario: 'optimistic' | 'pessimistic' | 'realistic') => {
    if (selectedScenarios.includes(scenario)) return;

    const request: ForecastRequest = {
      productId,
      days: baseForecast.metadata?.forecastHorizon || 14,
      sellingPrice: baseForecast.revenueProjection?.[0]?.sellingPrice,
      models: baseForecast.modelsUsed,
      includeConfidence: true,
      scenario
    };

    try {
      const result = await forecastMutation.mutateAsync(request);
      setComparisonData(prev => [...prev, result]);
      setSelectedScenarios(prev => [...prev, scenario]);
    } catch (error) {
      console.error('Failed to generate scenario forecast:', error);
    }
  };

  const chartData = useMemo(() => {
    if (!comparisonData.length) return [];

    const baseData = comparisonData[0];
    const dates = baseData.forecastData.map(d => format(parseISO(d.date), 'dd/MM/yyyy'));

    return dates.map((date, index) => {
      const dataPoint: any = { date };

      comparisonData.forEach((forecast, forecastIndex) => {
        const scenario = selectedScenarios[forecastIndex] || 'realistic';
        const forecastPoint = forecast.forecastData[index];

        if (forecastPoint) {
          dataPoint[`${scenario}_demand`] = forecastPoint.predictedValue;
          dataPoint[`${scenario}_lower`] = forecastPoint.confidenceLower;
          dataPoint[`${scenario}_upper`] = forecastPoint.confidenceUpper;

          // Revenue data
          const revenuePoint = forecast.revenueProjection?.[index];
          if (revenuePoint) {
            dataPoint[`${scenario}_revenue`] = revenuePoint.projectedRevenue;
          }
        }
      });

      return dataPoint;
    });
  }, [comparisonData, selectedScenarios]);

  const summaryMetrics = useMemo(() => {
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
  }, [comparisonData, selectedScenarios]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value?.toLocaleString() || 'N/A'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="flex items-center space-x-2">
                <Button
                  variant={selectedScenarios.includes(scenario.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => generateScenarioForecast(scenario.id as any)}
                  disabled={selectedScenarios.includes(scenario.id) || forecastMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  {forecastMutation.isPending && !selectedScenarios.includes(scenario.id) ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: scenario.color }}
                    />
                  )}
                  <span>{scenario.name}</span>
                </Button>
                <span className="text-xs text-muted-foreground">{scenario.description}</span>
              </div>
            ))}
          </div>

          {/* Selected Scenarios */}
          <div className="flex flex-wrap gap-1">
            {selectedScenarios.map(scenarioId => {
              const scenario = scenarios.find(s => s.id === scenarioId);
              return scenario ? (
                <Badge key={scenarioId} style={{ backgroundColor: scenario.color, color: 'white' }}>
                  {scenario.name}
                </Badge>
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">{metric.scenario} Scenario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Demand</span>
                  <span className="font-medium">{metric.avgDemand} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-medium">${metric.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <span className="font-medium">{metric.confidence}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Comparison Charts</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="demand" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="demand" className="flex items-center">
                <LineChartIcon className="h-4 w-4 mr-2" />
                Demand Trends
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Revenue Comparison
              </TabsTrigger>
            </TabsList>

            <TabsContent value="demand" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {selectedScenarios.map((scenario, _index) => {
                      const scenarioConfig = scenarios.find(s => s.id === scenario);
                      return (
                        <Line
                          key={scenario}
                          type="monotone"
                          dataKey={`${scenario}_demand`}
                          stroke={scenarioConfig?.color || '#3b82f6'}
                          strokeWidth={2}
                          name={`${scenarioConfig?.name || scenario} Demand`}
                          connectNulls={false}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {selectedScenarios.map((scenario, _index) => {
                      const scenarioConfig = scenarios.find(s => s.id === scenario);
                      return (
                        <Bar
                          key={scenario}
                          dataKey={`${scenario}_revenue`}
                          fill={scenarioConfig?.color || '#3b82f6'}
                          name={`${scenarioConfig?.name || scenario} Revenue`}
                        />
                      );
                    })}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Scenario Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summaryMetrics.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Revenue Range</h4>
                  <p className="text-sm text-muted-foreground">
                    From ${Math.min(...summaryMetrics.map(m => m.totalRevenue)).toLocaleString()} to $
                    {Math.max(...summaryMetrics.map(m => m.totalRevenue)).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Best Case vs Worst Case</h4>
                  <p className="text-sm text-muted-foreground">
                    {summaryMetrics.length >= 3 ? (
                      `${Math.round(((summaryMetrics.find(m => m.scenario === 'optimistic')?.totalRevenue || 0) /
                        (summaryMetrics.find(m => m.scenario === 'pessimistic')?.totalRevenue || 1) - 1) * 100)}% revenue difference`
                    ) : 'Compare multiple scenarios for insights'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Recommended Scenario</p>
                <p className="text-sm text-muted-foreground">
                  {summaryMetrics.reduce((best, current) =>
                    current.confidence > best.confidence ? current : best
                  ).scenario} (highest confidence)
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScenarioSelect?.('realistic')}
              >
                Apply Recommended
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
