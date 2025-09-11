import { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { ForecastResponse } from '@/types/api';
import { AlertItem, AlertSettings, UseAutomatedAlertsResult } from './types';

function generateAlerts(forecastData: ForecastResponse, settings: AlertSettings): AlertItem[] {
  if (!forecastData.forecastData.length) return [];

  const newAlerts: AlertItem[] = [];
  const forecastValues = forecastData.forecastData.map(d => d.predictedValue);
  const avgForecast = forecastValues.reduce((sum, val) => sum + val, 0) / forecastValues.length;
  const maxForecast = Math.max(...forecastValues);
  const minForecast = Math.min(...forecastValues);
  const volatility = ((maxForecast - minForecast) / avgForecast) * 100;

  // High volatility alert
  if (settings.highVolatility && volatility > 30) {
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
  if (settings.demandSpike && maxForecast > avgForecast * 1.5) {
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
  if (settings.revenueDrop && forecastData.revenueProjection) {
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
  if (settings.lowConfidence && (forecastData.confidence || 0) < 0.7) {
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
  if (settings.seasonalAnomaly && forecastData.forecastData.length >= 7) {
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

  return newAlerts;
}

export function useAutomatedAlerts(
  forecastData: ForecastResponse,
  _historicalData: any[] = []
): UseAutomatedAlertsResult {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [settings, setSettings] = useState<AlertSettings>({
    highVolatility: true,
    demandSpike: true,
    revenueDrop: true,
    lowConfidence: true,
    seasonalAnomaly: true
  });

  // Generate alerts based on forecast data
  useEffect(() => {
    const newAlerts = generateAlerts(forecastData, settings);
    setAlerts(newAlerts);
  }, [forecastData, settings]);

  const toggleSetting = (setting: keyof AlertSettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    toast.success(`${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${settings[setting] ? 'disabled' : 'enabled'}`);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const dismissedAlerts = alerts.filter(alert => alert.dismissed);

  return {
    alerts,
    settings,
    activeAlerts,
    dismissedAlerts,
    toggleSetting,
    dismissAlert,
  };
}
