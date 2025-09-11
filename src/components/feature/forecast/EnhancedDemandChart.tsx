"use client";
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DemandRecord, ForecastDataPoint } from '@/types/api';
import { ChartSkeleton } from '@/components/common/Skeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Activity, BarChart3, Target } from 'lucide-react';

interface EnhancedDemandChartProps {
  demandData: DemandRecord[];
  forecastData?: ForecastDataPoint[];
  isLoading?: boolean;
  selectedProductIds?: string[];
  showConfidence?: boolean;
}

export function EnhancedDemandChart({
  demandData,
  forecastData,
  isLoading = false,
  selectedProductIds = [],
  showConfidence = true
}: EnhancedDemandChartProps) {
  const chartData = useMemo(() => {
    if (!demandData.length && !forecastData?.length) return [];

    // Filter demand data by selected products if specified
    const filteredDemandData = selectedProductIds.length > 0
      ? demandData.filter(record => selectedProductIds.includes(record.productId))
      : demandData;

    // Aggregate demand data by date
    const demandByDate = filteredDemandData.reduce((acc, record) => {
      const date = format(parseISO(record.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, actualDemand: 0, totalValue: 0, count: 0 };
      }
      acc[date].actualDemand += record.quantity;
      acc[date].totalValue += record.quantity * record.price;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; actualDemand: number; totalValue: number; count: number }>);

    const demandEntries = Object.values(demandByDate);

    // Combine with forecast data
    const forecastEntries = forecastData?.map(point => ({
      date: format(parseISO(point.date), 'yyyy-MM-dd'),
      forecastDemand: point.predictedValue,
      confidenceLower: point.confidenceLower,
      confidenceUpper: point.confidenceUpper,
      modelUsed: point.modelUsed
    })) || [];

    // Merge demand and forecast data
    const allDates = new Set([
      ...demandEntries.map(d => d.date),
      ...forecastEntries.map(f => f.date),
    ]);

    const mergedData = Array.from(allDates).map(date => {
      const demandEntry = demandEntries.find(d => d.date === date);
      const forecastEntry = forecastEntries.find(f => f.date === date);

      return {
        date,
        actualDemand: demandEntry?.actualDemand || null,
        forecastDemand: forecastEntry?.forecastDemand || null,
        confidenceLower: forecastEntry?.confidenceLower || null,
        confidenceUpper: forecastEntry?.confidenceUpper || null,
        totalValue: demandEntry?.totalValue || null,
        displayDate: format(parseISO(date), 'MMM dd'),
        dataPoints: demandEntry?.count || 0,
        modelUsed: forecastEntry?.modelUsed || null
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    return mergedData;
  }, [demandData, forecastData, selectedProductIds]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value?.toFixed(2) || 'N/A'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Enhanced Demand Chart</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Enhanced Demand Chart</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No data to display</p>
              <p className="text-sm">Add sales records to see demand trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="chart-container">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span>Enhanced Demand Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="forecast" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="forecast">Forecast View</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="space-y-4">
            <ErrorBoundary>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" opacity={0.3} />
                    <XAxis
                      dataKey="displayDate"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {/* Confidence interval area */}
                    {showConfidence && forecastData && (
                      <Area
                        type="monotone"
                        dataKey="confidenceUpper"
                        stackId="1"
                        stroke="none"
                        fill="hsl(var(--chart-forecast))"
                        fillOpacity={0.1}
                      />
                    )}
                    {showConfidence && forecastData && (
                      <Area
                        type="monotone"
                        dataKey="confidenceLower"
                        stackId="1"
                        stroke="none"
                        fill="hsl(var(--background))"
                        fillOpacity={1}
                      />
                    )}

                    {/* Actual demand line */}
                    <Line
                      type="monotone"
                      dataKey="actualDemand"
                      stroke="hsl(var(--chart-demand))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-demand))', strokeWidth: 2, r: 4 }}
                      name="Actual Demand"
                      connectNulls={false}
                    />

                    {/* Forecast line */}
                    {forecastData && (
                      <Line
                        type="monotone"
                        dataKey="forecastDemand"
                        stroke="hsl(var(--chart-forecast))"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: 'hsl(var(--chart-forecast))', strokeWidth: 2, r: 4 }}
                        name="Forecast"
                        connectNulls={false}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayDate" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="actualDemand"
                      stroke="hsl(var(--chart-demand))"
                      strokeWidth={2}
                      name="Actual"
                    />
                    <Line
                      type="monotone"
                      dataKey="forecastDemand"
                      stroke="hsl(var(--chart-forecast))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Forecast"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Analysis Summary</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Data points: {chartData.filter(d => d.actualDemand).length}</p>
                  <p>Forecast points: {chartData.filter(d => d.forecastDemand).length}</p>
                  <p>Average actual: {chartData.filter(d => d.actualDemand).reduce((sum, d) => sum + (d.actualDemand || 0), 0) / chartData.filter(d => d.actualDemand).length || 0}</p>
                  <p>Average forecast: {chartData.filter(d => d.forecastDemand).reduce((sum, d) => sum + (d.forecastDemand || 0), 0) / chartData.filter(d => d.forecastDemand).length || 0}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Forecast Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>Historical data points: {chartData.filter(d => d.actualDemand).length}</p>
                    <p>Forecast coverage: {Math.round((chartData.filter(d => d.forecastDemand).length / chartData.length) * 100)}%</p>
                    <p>Confidence intervals: {showConfidence ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trend Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>Latest actual: {chartData.filter(d => d.actualDemand).slice(-1)[0]?.actualDemand?.toFixed(2) || 'N/A'}</p>
                    <p>Latest forecast: {chartData.filter(d => d.forecastDemand).slice(-1)[0]?.forecastDemand?.toFixed(2) || 'N/A'}</p>
                    <p>Data completeness: {Math.round((chartData.filter(d => d.actualDemand || d.forecastDemand).length / chartData.length) * 100)}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
