import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ForecastParametersProps, Scenario } from './types';

export const ForecastParameters: React.FC<ForecastParametersProps> = ({
  forecastDays,
  sellingPrice,
  scenario,
  includeConfidence,
  onDaysChange,
  onPriceChange,
  onScenarioChange,
  onConfidenceChange,
  disabled
}) => {
  const scenarios: Scenario[] = [
    { id: 'optimistic', name: 'Optimistic', description: 'Best case scenario' },
    { id: 'realistic', name: 'Realistic', description: 'Balanced scenario' },
    { id: 'pessimistic', name: 'Pessimistic', description: 'Worst case scenario' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Forecast Days</Label>
          <Input
            type="number"
            min="1"
            max="365"
            value={forecastDays}
            onChange={(e) => onDaysChange(parseInt(e.target.value) || 14)}
            disabled={disabled}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Selling Price (Rp)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={sellingPrice}
            onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
            disabled={disabled}
            placeholder="Optional"
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Scenario</Label>
          <Select value={scenario} onValueChange={onScenarioChange} disabled={disabled}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="confidence"
            checked={includeConfidence}
            onCheckedChange={onConfidenceChange}
            disabled={disabled}
          />
          <Label htmlFor="confidence" className="text-sm font-medium">
            Include Confidence Intervals
          </Label>
        </div>
      </div>
    </div>
  );
};
