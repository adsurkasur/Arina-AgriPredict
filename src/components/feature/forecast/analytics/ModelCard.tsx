import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain } from 'lucide-react';
import { ModelCardProps } from './types';

export const ModelCard: React.FC<ModelCardProps> = ({ model, isSelected, onSelect }) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onSelect(model.id)}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            {model.name}
          </span>
          <Badge variant={model.accuracy > 90 ? "default" : "secondary"}>
            {model.accuracy}% Accuracy
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Accuracy</span>
            <span>{model.accuracy}%</span>
          </div>
          <Progress value={model.accuracy} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Confidence</span>
            <span>{Math.round(model.confidence * 100)}%</span>
          </div>
          <Progress value={model.confidence * 100} className="h-2" />
        </div>

        <div className="pt-2 border-t">
          <h4 className="text-sm font-medium mb-2">Parameters</h4>
          <div className="text-xs text-muted-foreground">
            {Object.entries(model.parameters).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Last trained: {new Date(model.lastTrained).toLocaleDateString('en-GB')}
        </div>
      </CardContent>
    </Card>
  );
};
