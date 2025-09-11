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
                stroke="none"
                fill="hsl(var(--chart-confidence))"
                fillOpacity={0.15}
                name="Confidence Interval"
              />
            )}

            {/* Confidence lower line */}
            {showConfidence && hasForecastData && (
              <Line
                type="monotone"
                dataKey="confidenceLower"
                stroke="hsl(var(--chart-confidence))"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Confidence Lower"
                connectNulls={false}
              />
            )}

            {/* Confidence upper line */}
            {showConfidence && hasForecastData && (
              <Line
                type="monotone"
                dataKey="confidenceUpper"
                stroke="hsl(var(--chart-confidence))"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Confidence Upper"
                connectNulls={false}
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
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ fill: 'hsl(var(--chart-forecast))', strokeWidth: 2, r: 5 }}
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
