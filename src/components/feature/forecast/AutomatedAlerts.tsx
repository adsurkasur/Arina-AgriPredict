"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/lib/toast';
import {
  Bell,
  BellOff,
  AlertTriangle,
  Target,
  X
} from 'lucide-react';
import { ForecastResponse } from '@/types/api';

interface AutomatedAlertsProps {
  forecastData: ForecastResponse;
  historicalData?: any[];
  onAlertDismiss?: (_alertId: string) => void;
}

interface AlertItem {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
  actionable?: boolean;
}

export function AutomatedAlerts({
  forecastData,
  historicalData: _historicalData = [],
  onAlertDismiss
}: AutomatedAlertsProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertSettings, setAlertSettings] = useState({
    highVolatility: true,
    demandSpike: true,
    revenueDrop: true,
    lowConfidence: true,
    seasonalAnomaly: true
  });

  // Generate alerts based on forecast data
  useEffect(() => {
    if (!forecastData.forecastData.length) return;

    const newAlerts: AlertItem[] = [];
    const forecastValues = forecastData.forecastData.map(d => d.predictedValue);
    const avgForecast = forecastValues.reduce((sum, val) => sum + val, 0) / forecastValues.length;
    const maxForecast = Math.max(...forecastValues);
    const minForecast = Math.min(...forecastValues);
    const volatility = ((maxForecast - minForecast) / avgForecast) * 100;

    // High volatility alert
    if (alertSettings.highVolatility && volatility > 30) {
      newAlerts.push({
        id: 'high-volatility',
        type: 'warning',
        title: 'High Demand Volatility Detected',
        message: `Forecast shows ${volatility.toFixed(1)}% volatility. Consider safety stock or supplier diversification.`,
        timestamp: new Date(),
        dismissed: false,
        actionable: true
      });
    }

    // Demand spike alert
    if (alertSettings.demandSpike && maxForecast > avgForecast * 1.5) {
      newAlerts.push({
        id: 'demand-spike',
        type: 'info',
        title: 'Demand Spike Predicted',
        message: `Peak demand of ${maxForecast} units expected. Prepare inventory accordingly.`,
        timestamp: new Date(),
        dismissed: false,
        actionable: true
      });
    }

    // Revenue drop alert
    if (alertSettings.revenueDrop && forecastData.revenueProjection) {
      const revenues = forecastData.revenueProjection.map(r => r.projectedRevenue);
      const revenueTrend = revenues.slice(-3).reduce((sum, val) => sum + val, 0) /
                          revenues.slice(0, 3).reduce((sum, val) => sum + val, 0);

      if (revenueTrend < 0.9) {
        newAlerts.push({
          id: 'revenue-drop',
          type: 'error',
          title: 'Revenue Decline Projected',
          message: `Revenue trend shows ${(Math.abs(1 - revenueTrend) * 100).toFixed(1)}% decline. Review pricing strategy.`,
          timestamp: new Date(),
          dismissed: false,
          actionable: true
        });
      }
    }

    // Low confidence alert
    if (alertSettings.lowConfidence && (forecastData.confidence || 0) < 0.7) {
      newAlerts.push({
        id: 'low-confidence',
        type: 'warning',
        title: 'Low Forecast Confidence',
        message: `Forecast confidence is ${(forecastData.confidence || 0) * 100}%. Consider collecting more historical data.`,
        timestamp: new Date(),
        dismissed: false,
        actionable: false
      });
    }

    // Seasonal anomaly alert
    if (alertSettings.seasonalAnomaly && forecastData.forecastData.length >= 7) {
      const weeklyPattern = forecastValues.slice(-7);
      const avgWeekly = weeklyPattern.reduce((sum, val) => sum + val, 0) / 7;
      const lastDay = weeklyPattern[weeklyPattern.length - 1];

      if (lastDay > avgWeekly * 1.3) {
        newAlerts.push({
          id: 'seasonal-anomaly',
          type: 'info',
          title: 'Seasonal Pattern Detected',
          message: `Unusual demand pattern detected. This may indicate seasonal trends or external factors.`,
          timestamp: new Date(),
          dismissed: false,
          actionable: false
        });
      }
    }

    // Success alert for good forecasts
    if (forecastData.confidence && forecastData.confidence > 0.85 && volatility < 20) {
      newAlerts.push({
        id: 'forecast-success',
        type: 'success',
        title: 'High-Quality Forecast Generated',
        message: `Forecast generated with ${Math.round((forecastData.confidence || 0) * 100)}% confidence and low volatility.`,
        timestamp: new Date(),
        dismissed: false,
        actionable: false
      });
    }

    setAlerts(newAlerts);
  }, [forecastData, alertSettings]);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
    onAlertDismiss?.(alertId);
  };

  const toggleAlertSetting = (setting: keyof typeof alertSettings) => {
    setAlertSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    toast.success(`${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${alertSettings[setting] ? 'disabled' : 'enabled'}`);
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const dismissedAlerts = alerts.filter(alert => alert.dismissed);

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <X className="h-4 w-4 text-red-600" />;
      case 'success': return <Target className="h-4 w-4 text-green-600" />;
      case 'info': return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertColor = (type: AlertItem['type']) => {
    switch (type) {
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'info': return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Alert Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(alertSettings).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {key === 'highVolatility' && 'Alerts for demand fluctuations >30%'}
                    {key === 'demandSpike' && 'Alerts for unusual demand spikes'}
                    {key === 'revenueDrop' && 'Alerts for projected revenue decline'}
                    {key === 'lowConfidence' && 'Alerts for forecasts with low confidence'}
                    {key === 'seasonalAnomaly' && 'Alerts for unusual seasonal patterns'}
                  </p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={() => toggleAlertSetting(key as keyof typeof alertSettings)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Active Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <Alert key={alert.id} className={getAlertColor(alert.type)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <AlertDescription className="mt-1">
                          {alert.message}
                        </AlertDescription>
                        <p className="text-xs text-muted-foreground mt-2">
                          {alert.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.actionable && (
                        <Badge variant="outline" className="text-xs">
                          Actionable
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{activeAlerts.filter(a => a.type === 'error').length}</div>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{activeAlerts.filter(a => a.type === 'warning').length}</div>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activeAlerts.filter(a => a.type === 'info').length}</div>
              <p className="text-sm text-muted-foreground">Info</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeAlerts.filter(a => a.type === 'success').length}</div>
              <p className="text-sm text-muted-foreground">Success</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dismissed Alerts History */}
      {dismissedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BellOff className="h-5 w-5 mr-2" />
              Alert History ({dismissedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {dismissedAlerts.slice(-5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    {getAlertIcon(alert.type)}
                    <span className="text-sm font-medium">{alert.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {alert.timestamp.toLocaleDateString('en-GB')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Alerts State */}
      {alerts.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Alerts</h3>
              <p className="text-muted-foreground">
                Your forecast looks good! No critical issues detected.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
