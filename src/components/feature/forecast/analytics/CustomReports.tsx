import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { CustomReportsProps } from './types';

export const CustomReports: React.FC<CustomReportsProps> = ({
  config,
  onConfigChange,
  onGenerateReport,
  templates
}) => {
  const handleConfigChange = (field: keyof typeof config, value: string) => {
    onConfigChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Custom Report Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Custom Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-title">Report Title</Label>
              <Input
                id="report-title"
                placeholder="Enter report title"
                value={config.title}
                onChange={(e) => handleConfigChange('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-range">Time Range</Label>
              <Select
                value={config.timeRange}
                onValueChange={(value) => handleConfigChange('timeRange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">Description</Label>
            <Textarea
              id="report-description"
              placeholder="Describe the purpose and scope of this report"
              value={config.description}
              onChange={(e) => handleConfigChange('description', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Report Format</Label>
            <Select
              value={config.format}
              onValueChange={(value) => handleConfigChange('format', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="powerpoint">PowerPoint Presentation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onGenerateReport} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Generate Custom Report
          </Button>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <template.icon className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
