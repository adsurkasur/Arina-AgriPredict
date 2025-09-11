import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertSummaryProps } from './types';

export function AlertSummary({ alerts }: AlertSummaryProps) {
  const criticalCount = alerts.filter(a => a.type === 'error').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  const infoCount = alerts.filter(a => a.type === 'info').length;
  const successCount = alerts.filter(a => a.type === 'success').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <p className="text-sm text-muted-foreground">Critical</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
            <p className="text-sm text-muted-foreground">Info</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <p className="text-sm text-muted-foreground">Success</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
