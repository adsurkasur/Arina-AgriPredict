"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity,
  Wifi,
  WifiOff,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  BarChart3,
  LineChart as LineChartIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface RealTimeDataStreamingProps {
  forecastData?: any;
  onDataUpdate?: (_data: RealTimeDataPoint) => void;
}

interface RealTimeDataPoint {
  timestamp: Date;
  demand: number;
  temperature: number;
  humidity: number;
  marketPrice: number;
  competitorActivity: number;
  status: 'normal' | 'warning' | 'critical';
}

interface StreamConfig {
  updateInterval: number;
  dataRetention: number;
  alertThresholds: {
    demand: { min: number; max: number };
    temperature: { min: number; max: number };
    marketPrice: { min: number; max: number };
  };
}

export function RealTimeDataStreaming({
  forecastData: _forecastData,
  onDataUpdate
}: RealTimeDataStreamingProps) {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamData, setStreamData] = useState<RealTimeDataPoint[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [config, setConfig] = useState<StreamConfig>({
    updateInterval: 5000, // 5 seconds
    dataRetention: 100, // Keep last 100 data points
    alertThresholds: {
      demand: { min: 50, max: 200 },
      temperature: { min: 15, max: 35 },
      marketPrice: { min: 10, max: 50 }
    }
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxDataPoints = 50; // Display last 50 points in chart

  // Simulate real-time data generation
  const generateRealTimeData = (): RealTimeDataPoint => {
    const now = new Date();
    const lastData = streamData[streamData.length - 1];

    // Generate realistic data with some randomness
    const demand = lastData
      ? Math.max(0, lastData.demand + (Math.random() - 0.5) * 20)
      : 100 + Math.random() * 50;

    const temperature = 20 + Math.sin(now.getHours() / 24 * Math.PI * 2) * 10 + (Math.random() - 0.5) * 5;
    const humidity = 60 + Math.sin(now.getHours() / 24 * Math.PI * 2) * 20 + (Math.random() - 0.5) * 10;
    const marketPrice = 25 + Math.sin(now.getMinutes() / 60 * Math.PI * 2) * 5 + (Math.random() - 0.5) * 2;
    const competitorActivity = Math.random() * 100;

    // Determine status based on thresholds
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (demand < config.alertThresholds.demand.min || demand > config.alertThresholds.demand.max) {
      status = 'warning';
    }
    if (temperature < config.alertThresholds.temperature.min || temperature > config.alertThresholds.temperature.max) {
      status = 'critical';
    }

    return {
      timestamp: now,
      demand: Math.round(demand),
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity),
      marketPrice: Math.round(marketPrice * 100) / 100,
      competitorActivity: Math.round(competitorActivity),
      status
    };
  };

  // Start/stop streaming
  const toggleStreaming = () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  const startStreaming = () => {
    setIsStreaming(true);
    setConnectionStatus('connecting');

    // Simulate connection delay
    setTimeout(() => {
      setConnectionStatus('connected');

      // Start data generation interval
      intervalRef.current = setInterval(() => {
        const newData = generateRealTimeData();
        setStreamData(prev => {
          const updated = [...prev, newData];
          // Keep only the last N data points for performance
          return updated.slice(-config.dataRetention);
        });

        onDataUpdate?.(newData);
      }, config.updateInterval);
    }, 1000);
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    setConnectionStatus('disconnected');

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Get current metrics
  const currentData = streamData[streamData.length - 1];
  const recentData = streamData.slice(-maxDataPoints);

  // Calculate trends
  const calculateTrend = (data: RealTimeDataPoint[], key: keyof RealTimeDataPoint) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-5);
    const older = data.slice(-10, -5);

    if (older.length === 0) return 0;

    const recentAvg = recent.reduce((sum, d) => sum + (d[key] as number), 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + (d[key] as number), 0) / older.length;

    return ((recentAvg - olderAvg) / olderAvg) * 100;
  };

  const demandTrend = calculateTrend(streamData, 'demand');
  const temperatureTrend = calculateTrend(streamData, 'temperature');
  const priceTrend = calculateTrend(streamData, 'marketPrice');

  // Status indicators
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Activity className="h-6 w-6 mr-2" />
            Real-Time Data Streaming
          </h2>
          <p className="text-muted-foreground">Live data monitoring and analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' && <Wifi className="h-4 w-4 text-green-600" />}
            {connectionStatus === 'connecting' && <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />}
            {connectionStatus === 'disconnected' && <WifiOff className="h-4 w-4 text-red-600" />}
            <Badge variant={
              connectionStatus === 'connected' ? 'default' :
              connectionStatus === 'connecting' ? 'secondary' : 'destructive'
            }>
              {connectionStatus}
            </Badge>
          </div>
          <Button
            onClick={toggleStreaming}
            variant={isStreaming ? "destructive" : "default"}
          >
            {isStreaming ? (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Stop Streaming
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Start Streaming
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Current Metrics Dashboard */}
      {currentData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Demand</CardTitle>
              {getStatusIcon(currentData.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentData.demand}</div>
              <p className={`text-xs ${demandTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {demandTrend > 0 ? '+' : ''}{demandTrend.toFixed(1)}% trend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <TrendingUp className={`h-4 w-4 ${temperatureTrend > 0 ? 'text-red-600' : 'text-blue-600'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentData.temperature}°C</div>
              <p className={`text-xs ${temperatureTrend > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {temperatureTrend > 0 ? '+' : ''}{temperatureTrend.toFixed(1)}% trend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Price</CardTitle>
              <TrendingUp className={`h-4 w-4 ${priceTrend > 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${currentData.marketPrice}</div>
              <p className={`text-xs ${priceTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceTrend > 0 ? '+' : ''}{priceTrend.toFixed(1)}% trend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Humidity</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentData.humidity}%</div>
              <p className="text-xs text-muted-foreground">Relative humidity</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Demand Stream</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={recentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                  formatter={(value: number) => [value, 'Demand']}
                />
                <Line
                  type="monotone"
                  dataKey="demand"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={recentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <Area
                  type="monotone"
                  dataKey="marketPrice"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Market Price"
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stackId="2"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.6}
                  name="Temperature"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Streaming Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Streaming Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Update Interval</Label>
              <Select
                value={config.updateInterval.toString()}
                onValueChange={(value) => setConfig(prev => ({
                  ...prev,
                  updateInterval: parseInt(value)
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">1 second</SelectItem>
                  <SelectItem value="2000">2 seconds</SelectItem>
                  <SelectItem value="5000">5 seconds</SelectItem>
                  <SelectItem value="10000">10 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Retention</Label>
              <Select
                value={config.dataRetention.toString()}
                onValueChange={(value) => setConfig(prev => ({
                  ...prev,
                  dataRetention: parseInt(value)
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 points</SelectItem>
                  <SelectItem value="100">100 points</SelectItem>
                  <SelectItem value="200">200 points</SelectItem>
                  <SelectItem value="500">500 points</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Auto-start Streaming</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isStreaming}
                  onCheckedChange={toggleStreaming}
                />
                <Label className="text-sm">
                  {isStreaming ? 'Streaming Active' : 'Streaming Inactive'}
                </Label>
              </div>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Alert Thresholds</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Demand Range</Label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={config.alertThresholds.demand.min}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      alertThresholds: {
                        ...prev.alertThresholds,
                        demand: {
                          ...prev.alertThresholds.demand,
                          min: parseInt(e.target.value) || 0
                        }
                      }
                    }))}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={config.alertThresholds.demand.max}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      alertThresholds: {
                        ...prev.alertThresholds,
                        demand: {
                          ...prev.alertThresholds.demand,
                          max: parseInt(e.target.value) || 0
                        }
                      }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Temperature Range (°C)</Label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={config.alertThresholds.temperature.min}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      alertThresholds: {
                        ...prev.alertThresholds,
                        temperature: {
                          ...prev.alertThresholds.temperature,
                          min: parseInt(e.target.value) || 0
                        }
                      }
                    }))}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={config.alertThresholds.temperature.max}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      alertThresholds: {
                        ...prev.alertThresholds,
                        temperature: {
                          ...prev.alertThresholds.temperature,
                          max: parseInt(e.target.value) || 0
                        }
                      }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Market Price Range ($)</Label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={config.alertThresholds.marketPrice.min}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      alertThresholds: {
                        ...prev.alertThresholds,
                        marketPrice: {
                          ...prev.alertThresholds.marketPrice,
                          min: parseInt(e.target.value) || 0
                        }
                      }
                    }))}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={config.alertThresholds.marketPrice.max}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      alertThresholds: {
                        ...prev.alertThresholds,
                        marketPrice: {
                          ...prev.alertThresholds.marketPrice,
                          max: parseInt(e.target.value) || 0
                        }
                      }
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Stream Status */}
      <Card>
        <CardHeader>
          <CardTitle>Stream Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data Points</p>
                <p className="text-lg font-bold">{streamData.length}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Update Rate</p>
                <p className="text-lg font-bold">{(1000 / config.updateInterval).toFixed(1)}/s</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Retention</p>
                <p className="text-lg font-bold">{config.dataRetention}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <LineChartIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={isStreaming ? "default" : "secondary"}>
                  {isStreaming ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
