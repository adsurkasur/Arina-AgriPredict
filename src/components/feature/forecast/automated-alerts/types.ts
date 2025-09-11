import { ForecastResponse } from '@/types/api';

export interface AutomatedAlertsProps {
  forecastData: ForecastResponse;
  historicalData?: any[];
  onAlertDismiss?: (_alertId: string) => void;
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
  actionable?: boolean;
}

export interface AlertSettings {
  highVolatility: boolean;
  demandSpike: boolean;
  revenueDrop: boolean;
  lowConfidence: boolean;
  seasonalAnomaly: boolean;
}

export interface AlertSummaryProps {
  alerts: AlertItem[];
}

export interface AlertSettingsProps {
  settings: AlertSettings;
  onSettingChange: (_setting: keyof AlertSettings) => void;
}

export interface ActiveAlertsProps {
  alerts: AlertItem[];
  onDismiss: (_alertId: string) => void;
}

export interface AlertHistoryProps {
  alerts: AlertItem[];
}

export interface UseAutomatedAlertsResult {
  alerts: AlertItem[];
  settings: AlertSettings;
  activeAlerts: AlertItem[];
  dismissedAlerts: AlertItem[];
  toggleSetting: (_setting: keyof AlertSettings) => void;
  dismissAlert: (_alertId: string) => void;
}
