import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RealTimeDataPoint } from './types';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';

interface MetricsDashboardProps {
  latestData?: RealTimeDataPoint;
  statusCounts: { normal: number; warning: number; critical: number };
  averageDemand: number;
  averageTemperature: number;
  averageHumidity: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  latestData,
  statusCounts,
  averageDemand,
  averageTemperature,
  averageHumidity
}) => {
  if (!latestData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-time Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available. Start streaming to see metrics.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: 'normal' | 'warning' | 'critical') => {
    const variants = {
      normal: 'secondary' as const,
      warning: 'outline' as const,
      critical: 'destructive' as const
    };

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const formatValue = (value: number, unit: string) => `${value.toFixed(1)}${unit}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {getStatusBadge(latestData.status)}
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Demand */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Demand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{latestData.demand}</span>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            Avg: {averageDemand.toFixed(0)}
          </p>
        </CardContent>
      </Card>

      {/* Temperature */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Temperature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{formatValue(latestData.temperature, '°C')}</span>
            <TrendingDown className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            Avg: {formatValue(averageTemperature, '°C')}
          </p>
        </CardContent>
      </Card>

      {/* Humidity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Humidity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{formatValue(latestData.humidity, '%')}</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            Avg: {formatValue(averageHumidity, '%')}
          </p>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Status Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Normal: {statusCounts.normal}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Warning: {statusCounts.warning}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Critical: {statusCounts.critical}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
