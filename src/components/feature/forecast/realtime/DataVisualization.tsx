import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { RealTimeDataPoint } from './types';

interface DataVisualizationProps {
  data: RealTimeDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
      <p className="font-medium">{`Time: ${label}`}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ color: entry.color }}>
          {`${entry.dataKey}: ${entry.value}`}
        </p>
      ))}
    </div>
  );
};

const prepareChartData = (data: RealTimeDataPoint[]) => {
  return data.slice(-50).map(point => ({
    time: point.timestamp.toLocaleTimeString(),
    demand: point.demand,
    temperature: point.temperature,
    humidity: point.humidity,
    marketPrice: point.marketPrice,
    competitorActivity: point.competitorActivity
  }));
};

const DemandPriceChart: React.FC<{ data: any[] }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Demand & Market Price Trends</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip content={<CustomTooltip />} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="demand"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="marketPrice"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const EnvironmentalChart: React.FC<{ data: any[] }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Environmental Factors</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="temperature"
            stackId="1"
            stroke="#ff7300"
            fill="#ff7300"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="humidity"
            stackId="2"
            stroke="#00ff00"
            fill="#00ff00"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const CompetitorActivityChart: React.FC<{ data: any[] }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Competitor Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="competitorActivity"
            stroke="#ff0000"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for visualization.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = prepareChartData(data);

  return (
    <div className="space-y-6">
      <DemandPriceChart data={chartData} />
      <EnvironmentalChart data={chartData} />
      <CompetitorActivityChart data={chartData} />
    </div>
  );
};
