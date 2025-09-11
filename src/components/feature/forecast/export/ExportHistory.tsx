import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportHistoryProps } from './types';

export const ExportHistory: React.FC<ExportHistoryProps> = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium">Weekly Summary Report</p>
              <p className="text-sm text-muted-foreground">Exported 2 days ago • CSV format</p>
            </div>
            <Badge variant="secondary">Ready</Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium">Monthly Forecast</p>
              <p className="text-sm text-muted-foreground">Exported 1 week ago • PDF format</p>
            </div>
            <Badge variant="secondary">Ready</Badge>
          </div>

          <Button variant="ghost" className="w-full mt-3">
            View All Exports
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
