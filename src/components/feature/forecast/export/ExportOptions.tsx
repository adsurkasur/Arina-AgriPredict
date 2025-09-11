import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ExportOptionsProps } from './types';

export const ExportOptions: React.FC<ExportOptionsProps> = ({
  options,
  onOptionsChange
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="include-summary"
          checked={options.includeSummary}
          onCheckedChange={(checked) => onOptionsChange({ includeSummary: checked === true })}
        />
        <Label htmlFor="include-summary" className="text-sm cursor-pointer">
          Include AI summary and insights
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="include-confidence"
          checked={options.includeConfidence}
          onCheckedChange={(checked) => onOptionsChange({ includeConfidence: checked === true })}
        />
        <Label htmlFor="include-confidence" className="text-sm cursor-pointer">
          Include confidence intervals
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="include-charts"
          checked={options.includeCharts}
          onCheckedChange={(checked) => onOptionsChange({ includeCharts: checked === true })}
        />
        <Label htmlFor="include-charts" className="text-sm cursor-pointer">
          Include chart visualizations
        </Label>
      </div>
    </div>
  );
};
