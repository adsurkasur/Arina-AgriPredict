import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataPreviewProps } from './types';

export const DataPreview: React.FC<DataPreviewProps> = ({
  forecastData,
  includeConfidence
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Demand</th>
                {includeConfidence && <th className="text-left p-2">Confidence</th>}
                <th className="text-left p-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.forecastData.slice(0, 5).map((point, index) => {
                const revenue = forecastData.revenueProjection?.[index];
                return (
                  <tr key={index} className="border-b">
                    <td className="p-2">{new Date(point.date).toLocaleDateString('en-GB')}</td>
                    <td className="p-2">{point.predictedValue}</td>
                    {includeConfidence && (
                      <td className="p-2">
                        {point.confidenceLower && point.confidenceUpper
                          ? `${point.confidenceLower}-${point.confidenceUpper}`
                          : 'N/A'
                        }
                      </td>
                    )}
                    <td className="p-2">
                      {revenue ? `$${revenue.projectedRevenue.toLocaleString()}` : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {forecastData.forecastData.length > 5 && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing first 5 rows of {forecastData.forecastData.length} total rows
          </p>
        )}
      </CardContent>
    </Card>
  );
};
