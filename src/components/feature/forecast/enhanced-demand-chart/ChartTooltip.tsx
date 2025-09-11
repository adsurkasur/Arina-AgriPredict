import { ChartTooltipProps } from './types';

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  const hasData = active && payload && payload.length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
      <p className="font-medium">{`Date: ${label}`}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ color: entry.color }} className="text-sm">
          {`${entry.name}: ${entry.value?.toFixed(2) || 'N/A'}`}
        </p>
      ))}
    </div>
  );
}
