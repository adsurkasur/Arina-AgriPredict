import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp } from 'lucide-react';
import { InsightsViewProps } from './types';
import { useChartMetrics } from './hooks';

export function InsightsView({ chartData, showConfidence }: InsightsViewProps) {
  const metrics = useChartMetrics(chartData);

  return (
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
            <p>Historical data points: {metrics.actualPoints}</p>
            <p>Forecast coverage: {metrics.forecastCoverage}%</p>
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
            <p>Latest actual: {metrics.latestActual}</p>
            <p>Latest forecast: {metrics.latestForecast}</p>
            <p>Data completeness: {metrics.dataCompleteness}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
