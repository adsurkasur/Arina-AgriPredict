import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';
import { EnhancedDemandChartProps } from './types';
import { useChartData } from './hooks';
import { ForecastView } from './ForecastView';
import { ComparisonView } from './ComparisonView';
import { InsightsView } from './InsightsView';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';

export function EnhancedDemandChart({
  demandData,
  forecastData,
  isLoading = false,
  selectedProductIds = [],
  showConfidence = true
}: EnhancedDemandChartProps) {
  const { chartData, hasData } = useChartData(
    demandData,
    forecastData,
    selectedProductIds,
    isLoading
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (!hasData) {
    return <EmptyState />;
  }

  const hasForecastData = forecastData && forecastData.length > 0;

  return (
    <Card className="chart-container">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span>Enhanced Demand Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="forecast" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="forecast">Forecast View</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="space-y-4">
            <ForecastView
              chartData={chartData}
              showConfidence={showConfidence}
              hasForecastData={!!hasForecastData}
            />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <ComparisonView chartData={chartData} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <InsightsView
              chartData={chartData}
              showConfidence={showConfidence}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
