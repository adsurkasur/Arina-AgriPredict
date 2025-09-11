import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ModelSelectorProps, ForecastModel } from './types';

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModels,
  onModelChange,
  disabled
}) => {
  const availableModels: ForecastModel[] = [
    { id: 'ensemble', name: 'Ensemble (Recommended)', description: 'Combines multiple models' },
    { id: 'sma', name: 'Simple Moving Average', description: 'Basic trend analysis' },
    { id: 'wma', name: 'Weighted Moving Average', description: 'Recent data weighted more' },
    { id: 'es', name: 'Exponential Smoothing', description: 'Seasonal trend analysis' },
    { id: 'arima', name: 'ARIMA', description: 'Statistical time series' },
    { id: 'catboost', name: 'CatBoost', description: 'Machine learning model' }
  ];

  const handleModelToggle = (modelId: string) => {
    if (modelId === 'ensemble') {
      onModelChange(['ensemble']);
    } else {
      const newModels = selectedModels.includes(modelId)
        ? selectedModels.filter(id => id !== modelId)
        : [...selectedModels.filter(m => m !== 'ensemble'), modelId];

      if (newModels.length === 0) {
        onModelChange(['ensemble']);
      } else {
        onModelChange(newModels);
      }
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Forecast Models</Label>
      <div className="grid grid-cols-2 gap-2">
        {availableModels.map((model) => (
          <div key={model.id} className="flex items-center space-x-2">
            <Checkbox
              id={model.id}
              checked={selectedModels.includes(model.id)}
              onCheckedChange={() => handleModelToggle(model.id)}
              disabled={disabled}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor={model.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {model.name}
              </Label>
              <p className="text-xs text-muted-foreground">
                {model.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
