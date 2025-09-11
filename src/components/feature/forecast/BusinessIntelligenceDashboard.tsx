"use client";
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  DollarSign,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { ForecastResponse } from '@/types/api';

interface BusinessIntelligenceDashboardProps {
  forecastData: ForecastResponse;
  historicalData?: any[];
}

export function BusinessIntelligenceDashboard({
  forecastData,
  historicalData: _historicalData = []
}: BusinessIntelligenceDashboardProps) {
  // Calculate key business metrics
  const metrics = useMemo(() => {
    if (!forecastData.forecastData.length) return null;

    const forecastValues = forecastData.forecastData.map(d => d.predictedValue);
    const avgForecast = forecastValues.reduce((sum, val) => sum + val, 0) / forecastValues.length;
    const maxForecast = Math.max(...forecastValues);
    const minForecast = Math.min(...forecastValues);
    const forecastVolatility = ((maxForecast - minForecast) / avgForecast) * 100;

    // Revenue calculations
    const totalRevenue = forecastData.revenueProjection?.reduce(
      (sum, item) => sum + item.projectedRevenue, 0
    ) || 0;

    const avgRevenue = totalRevenue / (forecastData.revenueProjection?.length || 1);

    // Risk assessment
    const confidenceScore = forecastData.confidence || 0.8;
    const riskLevel = confidenceScore > 0.85 ? 'Low' : confidenceScore > 0.7 ? 'Medium' : 'High';

    // Growth trends
    const firstHalf = forecastValues.slice(0, Math.floor(forecastValues.length / 2));
    const secondHalf = forecastValues.slice(Math.floor(forecastValues.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    const growthRate = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    return {
      avgForecast,
      maxForecast,
      minForecast,
      forecastVolatility,
      totalRevenue,
      avgRevenue,
      confidenceScore,
      riskLevel,
      growthRate,
      forecastValues
    };
  }, [forecastData]);

  if (!metrics) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rate < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Daily Demand</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.avgForecast)}</div>
            <p className="text-xs text-muted-foreground">
              units per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Projection</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${Math.round(metrics.avgRevenue)}/day avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecast Confidence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.confidenceScore * 100)}%</div>
            <Progress value={metrics.confidenceScore * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Trend</CardTitle>
            {getGrowthIcon(metrics.growthRate)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.abs(metrics.growthRate).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.growthRate > 0 ? 'Increasing' : metrics.growthRate < 0 ? 'Decreasing' : 'Stable'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Risk Level</span>
            <Badge className={getRiskColor(metrics.riskLevel)}>
              {metrics.riskLevel} Risk
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Demand Volatility</span>
              <span>{metrics.forecastVolatility.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(metrics.forecastVolatility, 100)} />
          </div>

          {metrics.riskLevel === 'High' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                High forecast volatility detected. Consider implementing safety stock or diversifying suppliers.
              </AlertDescription>
            </Alert>
          )}

          {metrics.growthRate < -10 && (
            <Alert>
              <TrendingDown className="h-4 w-4" />
              <AlertDescription>
                Significant demand decline projected. Review pricing strategy and market conditions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Revenue Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Revenue Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${Math.round(metrics.totalRevenue * 1.1).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Optimistic Scenario</p>
              <p className="text-xs text-green-600">+10% growth</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${Math.round(metrics.totalRevenue).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Realistic Scenario</p>
              <p className="text-xs text-blue-600">Base projection</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                ${Math.round(metrics.totalRevenue * 0.9).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Conservative Scenario</p>
              <p className="text-xs text-red-600">-10% risk</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actionable Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Actionable Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Inventory Planning</p>
                <p className="text-sm text-muted-foreground">
                  Maintain {Math.round(metrics.maxForecast * 1.2)} units safety stock for peak demand periods.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Revenue Optimization</p>
                <p className="text-sm text-muted-foreground">
                  {metrics.growthRate > 0
                    ? `Consider price increases during growth periods to maximize revenue.`
                    : `Focus on cost optimization and efficiency improvements.`
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Risk Management</p>
                <p className="text-sm text-muted-foreground">
                  {metrics.riskLevel === 'High'
                    ? `Implement hedging strategies and diversify supply sources.`
                    : `Monitor forecast accuracy and adjust strategies as needed.`
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
