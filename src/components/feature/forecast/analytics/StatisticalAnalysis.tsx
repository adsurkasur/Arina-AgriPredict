import React from 'react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { MetricCard } from './MetricCard';
import { ChartContainer } from './ChartContainer';
import { StatisticalAnalysisProps } from './types';

export const StatisticalAnalysis: React.FC<StatisticalAnalysisProps> = ({
  statisticalMetrics,
  correlationData
}) => {
  return (
    <div className="space-y-4">
      {/* Statistical Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statisticalMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Statistical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Demand Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="demand"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Confidence Intervals">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Confidence Range"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};
