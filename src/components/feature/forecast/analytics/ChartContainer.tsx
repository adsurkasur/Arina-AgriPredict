import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainerProps } from './types';

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  height = 300
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
};
