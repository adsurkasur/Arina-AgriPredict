import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';
import { AlertSettingsProps } from './types';

export function AlertSettings({ settings, onSettingChange }: AlertSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Alert Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(settings).map(([key, enabled]) => (
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
                onCheckedChange={() => onSettingChange(key as keyof typeof settings)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
