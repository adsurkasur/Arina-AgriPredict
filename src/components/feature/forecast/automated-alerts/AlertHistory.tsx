import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BellOff } from 'lucide-react';
import { AlertHistoryProps } from './types';

export function AlertHistory({ alerts }: AlertHistoryProps) {
  if (alerts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BellOff className="h-5 w-5 mr-2" />
          Alert History ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {alerts.slice(-5).map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
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
  );
}
