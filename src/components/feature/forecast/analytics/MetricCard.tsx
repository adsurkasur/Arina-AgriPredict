import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { MetricCardProps } from './types';

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Activity className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
        {getTrendIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {metric.value.toLocaleString()} {metric.unit}
        </div>
        {metric.change !== 0 && (
          <p className={`text-xs ${getTrendColor()}`}>
            {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}% from baseline
          </p>
        )}
      </CardContent>
    </Card>
  );
};
