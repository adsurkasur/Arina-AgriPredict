import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ModelCard } from './ModelCard';
import { ChartContainer } from './ChartContainer';
import { PredictiveModelsProps } from './types';

export const PredictiveModels: React.FC<PredictiveModelsProps> = ({
  models,
  selectedModel,
  onModelSelect
}) => {
  const chartData = models.map(model => ({
    name: model.name.split(' ')[0],
    accuracy: model.accuracy,
    confidence: model.confidence * 100
  }));

  return (
    <div className="space-y-4">
      {/* Header with Model Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Predictive Models</h3>
          <p className="text-sm text-muted-foreground">Compare and select optimal forecasting models</p>
        </div>
        <Select value={selectedModel} onValueChange={onModelSelect}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            isSelected={selectedModel === model.id}
            onSelect={onModelSelect}
          />
        ))}
      </div>

      {/* Model Performance Comparison Chart */}
      <ChartContainer title="Model Performance Comparison">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy %" />
            <Bar dataKey="confidence" fill="#10b981" name="Confidence %" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
