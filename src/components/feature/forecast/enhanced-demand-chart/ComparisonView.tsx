import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line
} from 'recharts';
import { ComparisonViewProps } from './types';
import { useChartMetrics } from './hooks';

export function ComparisonView({ chartData }: ComparisonViewProps) {
  const metrics = useChartMetrics(chartData);

  return (
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
          <p>Data points: {metrics.actualPoints}</p>
          <p>Forecast points: {metrics.forecastPoints}</p>
          <p>Average actual: {metrics.avgActual.toFixed(2)}</p>
          <p>Average forecast: {metrics.avgForecast.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
