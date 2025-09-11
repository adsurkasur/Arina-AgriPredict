import { AutomatedAlertsProps } from './types';
import { useAutomatedAlerts } from './hooks';
import { AlertSettings } from './AlertSettings';
import { ActiveAlerts } from './ActiveAlerts';
import { AlertSummary } from './AlertSummary';
import { AlertHistory } from './AlertHistory';
import { NoAlertsState } from './NoAlertsState';

export function AutomatedAlerts({
  forecastData,
  historicalData = [],
  onAlertDismiss
}: AutomatedAlertsProps) {
  const {
    activeAlerts,
    dismissedAlerts,
    settings,
    toggleSetting,
    dismissAlert
  } = useAutomatedAlerts(forecastData, historicalData);

  const handleDismiss = (alertId: string) => {
    dismissAlert(alertId);
    onAlertDismiss?.(alertId);
  };

  const hasAnyAlerts = activeAlerts.length > 0 || dismissedAlerts.length > 0;

  return (
    <div className="space-y-6">
      {/* Alert Settings */}
      <AlertSettings
        settings={settings}
        onSettingChange={toggleSetting}
      />

      {/* Active Alerts */}
      <ActiveAlerts
        alerts={activeAlerts}
        onDismiss={handleDismiss}
      />

      {/* Alert Summary */}
      {hasAnyAlerts && (
        <AlertSummary alerts={activeAlerts} />
      )}

      {/* Alert History */}
      <AlertHistory alerts={dismissedAlerts} />

      {/* No Alerts State */}
      {!hasAnyAlerts && (
        <NoAlertsState />
      )}
    </div>
  );
}
