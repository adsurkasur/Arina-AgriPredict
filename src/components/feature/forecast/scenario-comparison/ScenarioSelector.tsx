import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ScenarioSelectorProps } from './types';

export function ScenarioSelector({
  scenarios,
  selectedScenarios,
  onScenarioSelect,
  isLoading = false
}: ScenarioSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="flex items-center space-x-2">
              <Button
                variant={selectedScenarios.includes(scenario.id) ? "default" : "outline"}
                size="sm"
                onClick={() => onScenarioSelect(scenario.id)}
                disabled={selectedScenarios.includes(scenario.id) || isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading && !selectedScenarios.includes(scenario.id) ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: scenario.color }}
                  />
                )}
                <span>{scenario.name}</span>
              </Button>
              <span className="text-xs text-muted-foreground">{scenario.description}</span>
            </div>
          ))}
        </div>

        {/* Selected Scenarios */}
        <div className="flex flex-wrap gap-1">
          {selectedScenarios.map(scenarioId => {
            const scenario = scenarios.find(s => s.id === scenarioId);
            return scenario ? (
              <Badge key={scenarioId} style={{ backgroundColor: scenario.color, color: 'white' }}>
                {scenario.name}
              </Badge>
            ) : null;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
