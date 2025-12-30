'use client';

import { useState, useMemo } from 'react';
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
  Bar,
  Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Trophy,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ComparisonResponse, ModelComparisonResult, ModelMetrics } from '@/types/api';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { cn } from '@/lib/utils';

interface ModelComparisonProps {
  comparisonData: ComparisonResponse | null;
  isLoading?: boolean;
  error?: Error | null;
}

// Model colors for consistent visualization
const MODEL_COLORS: Record<string, string> = {
  sma: '#3b82f6',       // blue
  wma: '#22c55e',       // green
  es: '#eab308',        // yellow
  arima: '#f97316',     // orange
  catboost: '#8b5cf6',  // purple
  ensemble: '#ec4899',  // pink
};

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  sma: 'Simple Moving Avg',
  wma: 'Weighted Moving Avg',
  es: 'Exponential Smoothing',
  arima: 'ARIMA',
  catboost: 'CatBoost',
  ensemble: 'Weighted Ensemble',
};

// Helper function to format metrics
function formatMetric(value: number | null, decimals: number = 2, suffix: string = ''): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}${suffix}`;
}

// Metric interpretation helper
function getMetricQuality(metricName: string, value: number | null): 'good' | 'medium' | 'poor' | 'unknown' {
  if (value === null) return 'unknown';
  
  switch (metricName) {
    case 'mae':
    case 'rmse':
      return value < 50 ? 'good' : value < 150 ? 'medium' : 'poor';
    case 'mape':
      return value < 10 ? 'good' : value < 25 ? 'medium' : 'poor';
    case 'mase':
      return value < 0.5 ? 'good' : value < 1 ? 'medium' : 'poor';
    case 'rSquared':
      return value > 0.8 ? 'good' : value > 0.5 ? 'medium' : 'poor';
    case 'bias':
      return Math.abs(value) < 10 ? 'good' : Math.abs(value) < 50 ? 'medium' : 'poor';
    default:
      return 'unknown';
  }
}

function getQualityColor(quality: 'good' | 'medium' | 'poor' | 'unknown'): string {
  switch (quality) {
    case 'good': return 'text-green-600 dark:text-green-400';
    case 'medium': return 'text-yellow-600 dark:text-yellow-400';
    case 'poor': return 'text-red-600 dark:text-red-400';
    default: return 'text-muted-foreground';
  }
}

// Loading skeleton component
function ComparisonSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// Best model highlight card
function BestModelCard({ model }: { model: ModelComparisonResult }) {
  return (
    <Card className="border-2 border-primary bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Best Model</CardTitle>
          </div>
          <Badge variant="default" className="text-sm">
            #{1} Rank
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: MODEL_COLORS[model.modelId] || '#6b7280' }}
          />
          <span className="text-xl font-bold">{model.modelName}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">MAE:</span>
            <span className={cn('ml-2 font-medium', getQualityColor(getMetricQuality('mae', model.metrics.mae)))}>
              {formatMetric(model.metrics.mae)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">R²:</span>
            <span className={cn('ml-2 font-medium', getQualityColor(getMetricQuality('rSquared', model.metrics.rSquared)))}>
              {formatMetric(model.metrics.rSquared, 4)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">MAPE:</span>
            <span className={cn('ml-2 font-medium', getQualityColor(getMetricQuality('mape', model.metrics.mape)))}>
              {formatMetric(model.metrics.mape, 2, '%')}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Weight:</span>
            <span className="ml-2 font-medium">
              {(model.weight * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Metrics table component
function MetricsTable({ models, ranking }: { models: ModelComparisonResult[]; ranking: string[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">MAE</TableHead>
            <TableHead className="text-right">RMSE</TableHead>
            <TableHead className="text-right">MAPE (%)</TableHead>
            <TableHead className="text-right">Bias</TableHead>
            <TableHead className="text-right">MASE</TableHead>
            <TableHead className="text-right">R²</TableHead>
            <TableHead className="text-right">Weight</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ranking.map((modelId, index) => {
            const model = models.find(m => m.modelId === modelId);
            if (!model) return null;
            
            return (
              <TableRow key={modelId} className={index === 0 ? 'bg-primary/5' : ''}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                    <span className="font-medium">#{index + 1}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: MODEL_COLORS[modelId] || '#6b7280' }}
                    />
                    <span className="font-medium">{model.modelName}</span>
                  </div>
                </TableCell>
                <TableCell className={cn('text-right', getQualityColor(getMetricQuality('mae', model.metrics.mae)))}>
                  {formatMetric(model.metrics.mae)}
                </TableCell>
                <TableCell className={cn('text-right', getQualityColor(getMetricQuality('rmse', model.metrics.rmse)))}>
                  {formatMetric(model.metrics.rmse)}
                </TableCell>
                <TableCell className={cn('text-right', getQualityColor(getMetricQuality('mape', model.metrics.mape)))}>
                  {formatMetric(model.metrics.mape)}
                </TableCell>
                <TableCell className={cn('text-right', getQualityColor(getMetricQuality('bias', model.metrics.bias)))}>
                  {formatMetric(model.metrics.bias)}
                </TableCell>
                <TableCell className={cn('text-right', getQualityColor(getMetricQuality('mase', model.metrics.mase)))}>
                  {formatMetric(model.metrics.mase, 4)}
                </TableCell>
                <TableCell className={cn('text-right', getQualityColor(getMetricQuality('rSquared', model.metrics.rSquared)))}>
                  {formatMetric(model.metrics.rSquared, 4)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {(model.weight * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// Forecast comparison chart
function ForecastComparisonChart({ models }: { models: ModelComparisonResult[] }) {
  const chartData = useMemo(() => {
    if (!models.length) return [];
    
    // Use the first model's forecast dates as reference
    const referenceModel = models[0];
    if (!referenceModel?.forecastData?.length) return [];
    
    return referenceModel.forecastData.map((point, index) => {
      const dataPoint: Record<string, any> = {
        date: format(parseISO(point.date), 'MM/dd'),
        fullDate: point.date,
      };
      
      models.forEach(model => {
        if (model.forecastData?.[index]) {
          dataPoint[model.modelId] = model.forecastData[index].predictedValue;
        }
      });
      
      return dataPoint;
    });
  }, [models]);

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        <p>No forecast data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            borderRadius: '8px',
          }}
          formatter={(value: number, name: string) => [
            value.toFixed(2),
            MODEL_DISPLAY_NAMES[name] || name.toUpperCase()
          ]}
        />
        <Legend
          formatter={(value) => MODEL_DISPLAY_NAMES[value] || value.toUpperCase()}
        />
        {models.map(model => (
          <Line
            key={model.modelId}
            type="monotone"
            dataKey={model.modelId}
            stroke={MODEL_COLORS[model.modelId] || '#6b7280'}
            strokeWidth={model.modelId === 'ensemble' ? 3 : 2}
            dot={false}
            strokeDasharray={model.modelId === 'ensemble' ? '0' : '0'}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Metrics bar chart comparison
function MetricsBarChart({ models, metricKey, title }: { 
  models: ModelComparisonResult[]; 
  metricKey: keyof ModelMetrics;
  title: string;
}) {
  const chartData = useMemo(() => {
    return models
      .filter(m => m.metrics[metricKey] !== null)
      .map(model => ({
        name: MODEL_DISPLAY_NAMES[model.modelId] || model.modelId,
        modelId: model.modelId,
        value: model.metrics[metricKey] as number,
      }))
      .sort((a, b) => {
        // For R², higher is better; for others, lower is better
        return metricKey === 'rSquared' ? b.value - a.value : a.value - b.value;
      });
  }, [models, metricKey]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis type="number" fontSize={12} />
        <YAxis type="category" dataKey="name" fontSize={11} width={120} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            borderRadius: '8px',
          }}
          formatter={(value: number) => [value.toFixed(4), title]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={MODEL_COLORS[entry.modelId] || '#6b7280'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Main component
export function ModelComparison({ comparisonData, isLoading, error }: ModelComparisonProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showFullSummary, setShowFullSummary] = useState(false);

  if (isLoading) {
    return <ComparisonSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load model comparison: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!comparisonData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No comparison data</p>
            <p className="text-sm">Select a product and run model comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { models, bestModel, ranking, summary, metadata } = comparisonData;
  const bestModelData = models.find(m => m.modelId === bestModel);

  return (
    <div className="space-y-6">
      {/* Header with metadata */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Model Comparison Results
              </CardTitle>
              <CardDescription className="mt-1">
                Compared {metadata.modelsCompared} models on {metadata.dataPoints} data points
              </CardDescription>
            </div>
            <Badge variant="outline">
              {metadata.forecastHorizon} day forecast
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Best model highlight */}
      {bestModelData && <BestModelCard model={bestModelData} />}

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricsTable models={models} ranking={ranking} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">MAE Comparison</CardTitle>
                <CardDescription>Mean Absolute Error (lower is better)</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricsBarChart models={models} metricKey="mae" title="MAE" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">R² Score Comparison</CardTitle>
                <CardDescription>Coefficient of Determination (higher is better)</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricsBarChart models={models} metricKey="rSquared" title="R²" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['mae', 'rmse', 'mape', 'bias', 'mase', 'rSquared'].map((metric) => (
              <Card key={metric}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base capitalize">
                    {metric === 'rSquared' ? 'R² Score' : metric.toUpperCase()}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {metric === 'rSquared' ? 'Higher is better' : 'Lower is better'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MetricsBarChart 
                    models={models} 
                    metricKey={metric as keyof ModelMetrics} 
                    title={metric.toUpperCase()} 
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Forecast Comparison
              </CardTitle>
              <CardDescription>
                Predicted values from all models over the forecast horizon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ForecastComparisonChart models={models} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                'prose dark:prose-invert max-w-none',
                !showFullSummary && 'max-h-96 overflow-hidden relative'
              )}>
                <MarkdownRenderer content={summary} />
                {!showFullSummary && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent" />
                )}
              </div>
              <Button
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setShowFullSummary(!showFullSummary)}
              >
                {showFullSummary ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show Full Summary
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metric Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            Metric Definitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">MAE</span>
              <p className="text-muted-foreground">Mean Absolute Error - average prediction error magnitude</p>
            </div>
            <div>
              <span className="font-medium">RMSE</span>
              <p className="text-muted-foreground">Root Mean Square Error - penalizes large errors more</p>
            </div>
            <div>
              <span className="font-medium">MAPE</span>
              <p className="text-muted-foreground">Mean Absolute Percentage Error - error as percentage</p>
            </div>
            <div>
              <span className="font-medium">Bias</span>
              <p className="text-muted-foreground">Systematic over/under prediction tendency</p>
            </div>
            <div>
              <span className="font-medium">MASE</span>
              <p className="text-muted-foreground">Mean Absolute Scaled Error - compared to naive forecast</p>
            </div>
            <div>
              <span className="font-medium">R²</span>
              <p className="text-muted-foreground">Coefficient of Determination - variance explained</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ModelComparison;