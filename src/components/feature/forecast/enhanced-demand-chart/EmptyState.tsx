import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { EmptyStateProps } from './types';

export function EmptyState({
  title = "Enhanced Demand Chart",
  message = "Add sales records to see demand trends"
}: EmptyStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No data to display</p>
            <p className="text-sm">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
