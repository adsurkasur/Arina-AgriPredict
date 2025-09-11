import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  Line
} from 'recharts';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ChartTooltip } from './ChartTooltip';
import { ForecastViewProps } from './types';

export function ForecastView({ chartData, showConfidence, hasForecastData }: ForecastViewProps) {
  return (
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
            <Tooltip content={<ChartTooltip />} />
            <Legend />

            {/* Confidence interval area */}
            {showConfidence && hasForecastData && (
              <Area
                type="monotone"
                dataKey="confidenceUpper"
                stackId="1"
                stroke="none"
                fill="hsl(var(--chart-forecast))"
                fillOpacity={0.1}
              />
            )}
            {showConfidence && hasForecastData && (
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
            {hasForecastData && (
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
  );
}
