import { ScenarioComparisonProps } from './types';
import { useScenarioComparison, useScenarios } from './hooks';
import { ScenarioSelector } from './ScenarioSelector';
import { SummaryMetrics } from './SummaryMetrics';
import { ScenarioCharts } from './ScenarioCharts';
import { ScenarioInsights } from './ScenarioInsights';

export function ScenarioComparison({
  baseForecast,
  productId,
  onScenarioSelect
}: ScenarioComparisonProps) {
  const scenarios = useScenarios();
  const {
    selectedScenarios,
    chartData,
    summaryMetrics,
    generateScenarioForecast,
    isLoading
  } = useScenarioComparison(baseForecast, productId);

  const handleScenarioSelect = (scenarioId: string) => {
    generateScenarioForecast(scenarioId as 'optimistic' | 'pessimistic' | 'realistic');
  };

  return (
    <div className="space-y-6">
      {/* Scenario Selection */}
      <ScenarioSelector
        scenarios={scenarios}
        selectedScenarios={selectedScenarios}
        onScenarioSelect={handleScenarioSelect}
        isLoading={isLoading}
      />

      {/* Summary Metrics */}
      <SummaryMetrics metrics={summaryMetrics} />

      {/* Charts */}
      <ScenarioCharts
        chartData={chartData}
        selectedScenarios={selectedScenarios}
        scenarios={scenarios}
      />

      {/* Scenario Insights */}
      <ScenarioInsights
        metrics={summaryMetrics}
        onScenarioSelect={onScenarioSelect}
      />
    </div>
  );
}
