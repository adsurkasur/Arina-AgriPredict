import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, AlertTriangle, X, Target } from 'lucide-react';
import { ActiveAlertsProps } from './types';

export function ActiveAlerts({ alerts, onDismiss }: ActiveAlertsProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <X className="h-4 w-4 text-red-600" />;
      case 'success': return <Target className="h-4 w-4 text-green-600" />;
      case 'info': return <Bell className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Active Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
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
                    onClick={() => onDismiss(alert.id)}
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
  );
}
