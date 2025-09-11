import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DemandRecord, ForecastDataPoint } from '@/types/api';
import { ChartSkeleton } from '@/components/common/Skeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Activity } from 'lucide-react';

interface DemandChartProps {
  demandData: DemandRecord[];
  forecastData?: ForecastDataPoint[];
  isLoading?: boolean;
  selectedProductId?: string | null;
}

export function DemandChart({ 
  demandData, 
  forecastData, 
  isLoading = false,
  selectedProductId 
}: DemandChartProps) {
  const chartData = useMemo(() => {
    if (!demandData.length && !forecastData?.length) return [];

    // Filter demand data by selected product if specified
    const filteredDemandData = selectedProductId 
      ? demandData.filter(item => item.productId === selectedProductId)
      : demandData;

    // Aggregate demand data by date
    const demandByDate = filteredDemandData.reduce((acc, record) => {
      const date = format(parseISO(record.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, actualDemand: 0, totalValue: 0 };
      }
      acc[date].actualDemand += record.quantity;
      acc[date].totalValue += record.quantity * record.price;
      return acc;
    }, {} as Record<string, { date: string; actualDemand: number; totalValue: number }>);

    const demandEntries = Object.values(demandByDate);

    // Combine with forecast data
    const forecastEntries = forecastData?.map(point => ({
      date: format(parseISO(point.date), 'yyyy-MM-dd'),
      forecastDemand: point.predictedValue,
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
        totalValue: demandEntry?.totalValue || null,
        displayDate: format(parseISO(date), 'dd/MM/yyyy'),
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    return mergedData;
  }, [demandData, forecastData, selectedProductId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Demand Chart</span>
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
            <span>Demand Chart</span>
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
    <Card className="chart-container" aria-label="Demand Chart">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>Demand Chart</span>
        </CardTitle>
      </CardHeader>
  <CardContent className="w-full overflow-hidden">
        <ErrorBoundary>
          <div className="h-80 w-full" role="region" aria-label="Demand chart" tabIndex={0}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} aria-label="Line chart of demand and forecast">
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--chart-grid))"
                  opacity={0.3}
                />
                <XAxis 
                  dataKey="displayDate"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  aria-label="Date axis"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  aria-label="Demand axis"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  aria-label="Chart tooltip"
                />
                <Legend aria-label="Chart legend" />
                {/* Actual demand line */}
                <Line
                  type="monotone"
                  dataKey="actualDemand"
                  stroke="hsl(var(--chart-demand))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-demand))', strokeWidth: 2, r: 4 }}
                  name="Actual Demand"
                  connectNulls={false}
                  aria-label="Actual demand line"
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
                    aria-label="Forecast line"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
}