import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { ScenarioChartsProps } from './types';

const CustomTooltip = ({ active, payload, label }: any) => {
  const hasData = active && payload && payload.length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
      <p className="font-medium">{`Date: ${label}`}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ color: entry.color }} className="text-sm">
          {`${entry.name}: ${entry.value?.toLocaleString() || 'N/A'}`}
        </p>
      ))}
    </div>
  );
};

export function ScenarioCharts({ chartData, selectedScenarios, scenarios }: ScenarioChartsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Comparison Charts</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="demand" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="demand" className="flex items-center">
              <LineChartIcon className="h-4 w-4 mr-2" />
              Demand Trends
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Revenue Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demand" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedScenarios.map((scenario) => {
                    const scenarioConfig = scenarios.find(s => s.id === scenario);
                    return (
                      <Line
                        key={scenario}
                        type="monotone"
                        dataKey={`${scenario}_demand`}
                        stroke={scenarioConfig?.color || '#3b82f6'}
                        strokeWidth={2}
                        name={`${scenarioConfig?.name || scenario} Demand`}
                        connectNulls={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedScenarios.map((scenario) => {
                    const scenarioConfig = scenarios.find(s => s.id === scenario);
                    return (
                      <Bar
                        key={scenario}
                        dataKey={`${scenario}_revenue`}
                        fill={scenarioConfig?.color || '#3b82f6'}
                        name={`${scenarioConfig?.name || scenario} Revenue`}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
