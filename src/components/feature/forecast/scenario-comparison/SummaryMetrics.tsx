import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SummaryMetricsProps } from './types';
import { formatCurrency } from '@/lib/utils';

export function SummaryMetrics({ metrics }: SummaryMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg capitalize">{metric.scenario} Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Demand</span>
                <span className="font-medium">{metric.avgDemand} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="font-medium">{formatCurrency(metric.totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <span className="font-medium">{metric.confidence}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
