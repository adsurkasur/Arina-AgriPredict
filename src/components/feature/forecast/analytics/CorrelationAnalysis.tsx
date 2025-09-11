import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CorrelationAnalysisProps } from './types';

export const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({ correlationData }) => {
  return (
    <div className="space-y-4">
      {/* Correlation Scatter Plot */}
      <Card>
        <CardHeader>
          <CardTitle>Demand vs Revenue Correlation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="demand" name="Demand" />
              <YAxis dataKey="revenue" name="Revenue" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Demand vs Revenue" dataKey="revenue" fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Correlation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Correlation Coefficient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">0.87</div>
            <p className="text-sm text-muted-foreground">Strong positive correlation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">R² Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">0.76</div>
            <p className="text-sm text-muted-foreground">76% variance explained</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trend Strength</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">High</div>
            <p className="text-sm text-muted-foreground">Consistent upward trend</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
