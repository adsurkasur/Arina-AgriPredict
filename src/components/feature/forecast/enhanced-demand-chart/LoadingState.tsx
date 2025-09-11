import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { ChartSkeleton } from '@/components/common/Skeleton';
import { LoadingStateProps } from './types';

export function LoadingState({ title = "Enhanced Demand Chart" }: LoadingStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartSkeleton />
      </CardContent>
    </Card>
  );
}
