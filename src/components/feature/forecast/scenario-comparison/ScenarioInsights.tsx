import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScenarioInsightsProps } from './types';
import { useScenarioInsights } from './hooks';

export function ScenarioInsights({ metrics, onScenarioSelect }: ScenarioInsightsProps) {
  const { revenueRange, bestVsWorstDifference, recommendedScenario } = useScenarioInsights(metrics);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.length > 1 && revenueRange && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Revenue Range</h4>
                <p className="text-sm text-muted-foreground">
                  From ${revenueRange.min.toLocaleString()} to $
                  {revenueRange.max.toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Best Case vs Worst Case</h4>
                <p className="text-sm text-muted-foreground">
                  {bestVsWorstDifference !== null
                    ? `${bestVsWorstDifference}% revenue difference`
                    : 'Compare multiple scenarios for insights'
                  }
                </p>
              </div>
            </div>
          )}

          {recommendedScenario && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Recommended Scenario</p>
                <p className="text-sm text-muted-foreground">
                  {recommendedScenario.scenario} (highest confidence)
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScenarioSelect?.('realistic')}
              >
                Apply Recommended
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
