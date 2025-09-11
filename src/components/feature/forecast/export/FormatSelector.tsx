import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FormatSelectorProps, ExportFormat } from './types';

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  formats,
  selectedFormat,
  onFormatChange
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Export Format</Label>
      <Select value={selectedFormat} onValueChange={onFormatChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {formats.map((format: ExportFormat) => (
            <SelectItem key={format.id} value={format.id}>
              <div className="flex items-center space-x-2">
                <format.icon className="h-4 w-4" />
                <div>
                  <div className="font-medium">{format.name}</div>
                  <div className="text-xs text-muted-foreground">{format.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
