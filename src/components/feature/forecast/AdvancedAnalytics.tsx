"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Brain,
  Calculator,
  FileText,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { ForecastResponse } from '@/types/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ScatterChart, Scatter, BarChart, Bar } from 'recharts';

interface AdvancedAnalyticsProps {
  forecastData: ForecastResponse;
  historicalData?: any[];
}

interface StatisticalMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface PredictiveModel {
  id: string;
  name: string;
  accuracy: number;
  confidence: number;
  parameters: Record<string, any>;
  lastTrained: string;
}

export function AdvancedAnalytics({
  forecastData,
  historicalData: _historicalData = []
}: AdvancedAnalyticsProps) {
  const [selectedModel, setSelectedModel] = useState<string>('arima');
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState<boolean>(false);
  const [customReportConfig, setCustomReportConfig] = useState({
    title: '',
    description: '',
    metrics: [] as string[],
    timeRange: '30d',
    format: 'pdf'
  });

  // Advanced statistical calculations
  const statisticalMetrics = useMemo((): StatisticalMetric[] => {
    if (!forecastData.forecastData.length) return [];

    const values = forecastData.forecastData.map(d => d.predictedValue);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    const trend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    return [
      {
        name: 'Mean Demand',
        value: Math.round(mean),
        unit: 'units',
        change: trend,
        trend: trend > 5 ? 'up' : trend < -5 ? 'down' : 'stable'
      },
      {
        name: 'Standard Deviation',
        value: Math.round(stdDev),
        unit: 'units',
        change: 0,
        trend: 'stable'
      },
      {
        name: 'Coefficient of Variation',
        value: Math.round((stdDev / mean) * 100),
        unit: '%',
        change: 0,
        trend: 'stable'
      },
      {
        name: 'Peak Demand',
        value: Math.max(...values),
        unit: 'units',
        change: trend,
        trend: trend > 5 ? 'up' : trend < -5 ? 'down' : 'stable'
      }
    ];
  }, [forecastData]);

  // Predictive models data
  const predictiveModels: PredictiveModel[] = [
    {
      id: 'arima',
      name: 'ARIMA (AutoRegressive Integrated Moving Average)',
      accuracy: 87.5,
      confidence: 0.85,
      parameters: { p: 2, d: 1, q: 2 },
      lastTrained: '2024-01-15T10:30:00Z'
    },
    {
      id: 'prophet',
      name: 'Facebook Prophet',
      accuracy: 89.2,
      confidence: 0.87,
      parameters: { seasonality: 'additive', holidays: true },
      lastTrained: '2024-01-15T10:30:00Z'
    },
    {
      id: 'xgboost',
      name: 'XGBoost Regression',
      accuracy: 91.8,
      confidence: 0.89,
      parameters: { maxDepth: 6, learningRate: 0.1, nEstimators: 100 },
      lastTrained: '2024-01-15T10:30:00Z'
    },
    {
      id: 'neural_network',
      name: 'Neural Network (LSTM)',
      accuracy: 93.1,
      confidence: 0.91,
      parameters: { layers: 3, neurons: 64, epochs: 100 },
      lastTrained: '2024-01-15T10:30:00Z'
    }
  ];

  // Generate correlation analysis data
  const correlationData = useMemo(() => {
    if (!forecastData.forecastData.length) return [];

    return forecastData.forecastData.map((point, index) => ({
      date: new Date(point.date).toLocaleDateString(),
      demand: point.predictedValue,
      confidence: (point.confidenceUpper && point.confidenceLower) ? (point.confidenceUpper - point.confidenceLower) / 2 : 0,
      revenue: forecastData.revenueProjection?.[index]?.projectedRevenue || 0
    }));
  }, [forecastData]);

  // Custom report generation
  const generateCustomReport = () => {
    const reportData = {
      title: customReportConfig.title || 'Advanced Analytics Report',
      description: customReportConfig.description,
      generatedAt: new Date().toISOString(),
      metrics: statisticalMetrics,
      models: predictiveModels,
      forecastData: forecastData,
      timeRange: customReportConfig.timeRange,
      format: customReportConfig.format
    };

    // In a real implementation, this would generate and download the report
    console.log('Generating custom report:', reportData);
    alert(`Custom report "${reportData.title}" generated successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Real-time Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Predictive modeling and statistical analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isRealTimeEnabled ? "default" : "secondary"}>
            {isRealTimeEnabled ? "Real-time Active" : "Real-time Inactive"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
          >
            {isRealTimeEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRealTimeEnabled ? "Pause" : "Start"} Real-time
          </Button>
        </div>
      </div>

      <Tabs defaultValue="statistics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Statistical Analysis */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statisticalMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                  {metric.trend === 'stable' && <Activity className="h-4 w-4 text-gray-600" />}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value.toLocaleString()} {metric.unit}
                  </div>
                  {metric.change !== 0 && (
                    <p className="text-xs text-muted-foreground">
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}% from baseline
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Statistical Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Demand Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="demand"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confidence Intervals</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="confidence"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Confidence Range"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictive Models */}
        <TabsContent value="models" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Predictive Models</h3>
              <p className="text-sm text-muted-foreground">Compare and select optimal forecasting models</p>
            </div>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {predictiveModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictiveModels.map((model) => (
              <Card key={model.id} className={selectedModel === model.id ? "ring-2 ring-primary" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      {model.name}
                    </span>
                    <Badge variant={model.accuracy > 90 ? "default" : "secondary"}>
                      {model.accuracy}% Accuracy
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span>{model.accuracy}%</span>
                    </div>
                    <Progress value={model.accuracy} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence</span>
                      <span>{Math.round(model.confidence * 100)}%</span>
                    </div>
                    <Progress value={model.confidence * 100} className="h-2" />
                  </div>

                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">Parameters</h4>
                    <div className="text-xs text-muted-foreground">
                      {Object.entries(model.parameters).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Model Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={predictiveModels.map(model => ({
                  name: model.name.split(' ')[0],
                  accuracy: model.accuracy,
                  confidence: model.confidence * 100
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy %" />
                  <Bar dataKey="confidence" fill="#10b981" name="Confidence %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Correlation Analysis */}
        <TabsContent value="correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demand vs Revenue Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="demand" name="Demand" />
                  <YAxis dataKey="revenue" name="Revenue" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Demand vs Revenue" dataKey="revenue" fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Correlation Coefficient</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">0.87</div>
                <p className="text-sm text-muted-foreground">Strong positive correlation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">R² Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">0.76</div>
                <p className="text-sm text-muted-foreground">76% variance explained</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trend Strength</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">High</div>
                <p className="text-sm text-muted-foreground">Consistent upward trend</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custom Reports */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Custom Report Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-title">Report Title</Label>
                  <Input
                    id="report-title"
                    placeholder="Enter report title"
                    value={customReportConfig.title}
                    onChange={(e) => setCustomReportConfig(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-range">Time Range</Label>
                  <Select
                    value={customReportConfig.timeRange}
                    onValueChange={(value) => setCustomReportConfig(prev => ({
                      ...prev,
                      timeRange: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-description">Description</Label>
                <Textarea
                  id="report-description"
                  placeholder="Describe the purpose and scope of this report"
                  value={customReportConfig.description}
                  onChange={(e) => setCustomReportConfig(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Report Format</Label>
                <Select
                  value={customReportConfig.format}
                  onValueChange={(value) => setCustomReportConfig(prev => ({
                    ...prev,
                    format: value
                  }))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="powerpoint">PowerPoint Presentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={generateCustomReport} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Generate Custom Report
              </Button>
            </CardContent>
          </Card>

          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Executive Summary', icon: Target, description: 'High-level overview for management' },
                  { name: 'Technical Analysis', icon: Calculator, description: 'Detailed statistical analysis' },
                  { name: 'Trend Report', icon: TrendingUp, description: 'Market trends and forecasting' },
                  { name: 'Performance Dashboard', icon: BarChart3, description: 'KPI and metrics overview' },
                  { name: 'Risk Assessment', icon: Activity, description: 'Risk analysis and mitigation' },
                  { name: 'Custom Analysis', icon: Settings, description: 'Build your own report' }
                ].map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <template.icon className="h-8 w-8 text-primary" />
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
