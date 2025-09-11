"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/lib/toast';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Image,
  Mail,
  Share2
} from 'lucide-react';
import { ForecastResponse } from '@/types/api';

interface ExportCapabilitiesProps {
  forecastData: ForecastResponse;
  productName?: string;
}

export function ExportCapabilities({
  forecastData,
  productName = 'Product'
}: ExportCapabilitiesProps) {
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [includeCharts, setIncludeCharts] = useState<boolean>(true);
  const [includeSummary, setIncludeSummary] = useState<boolean>(true);
  const [includeConfidence, setIncludeConfidence] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const exportFormats = [
    { id: 'csv', name: 'CSV', icon: FileSpreadsheet, description: 'Excel-compatible spreadsheet' },
    { id: 'json', name: 'JSON', icon: FileJson, description: 'Structured data format' },
    { id: 'pdf', name: 'PDF Report', icon: FileText, description: 'Formatted report with charts' },
    { id: 'png', name: 'PNG Image', icon: Image, description: 'Chart visualization' }
  ];

  const generateCSV = () => {
    const headers = [
      'Date',
      'Predicted Demand',
      ...(includeConfidence ? ['Confidence Lower', 'Confidence Upper'] : []),
      'Projected Revenue',
      'Model Used'
    ];

    const rows = forecastData.forecastData.map((point, index) => {
      const revenue = forecastData.revenueProjection?.[index];
      return [
        point.date,
        point.predictedValue,
        ...(includeConfidence ? [
          point.confidenceLower || '',
          point.confidenceUpper || ''
        ] : []),
        revenue?.projectedRevenue || '',
        point.modelUsed || ''
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  };

  const generateJSON = () => {
    const exportData = {
      metadata: {
        productName,
        generatedAt: new Date().toISOString(),
        forecastHorizon: forecastData.metadata?.forecastHorizon,
        modelsUsed: forecastData.modelsUsed,
        confidence: forecastData.confidence,
        scenario: forecastData.scenario
      },
      forecast: forecastData.forecastData,
      revenue: includeSummary ? forecastData.revenueProjection : undefined,
      summary: includeSummary ? forecastData.summary : undefined
    };

    return JSON.stringify(exportData, null, 2);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (exportFormat) {
        case 'csv':
          content = generateCSV();
          filename = `${productName.toLowerCase().replace(/\s+/g, '-')}-forecast.csv`;
          mimeType = 'text/csv';
          break;

        case 'json':
          content = generateJSON();
          filename = `${productName.toLowerCase().replace(/\s+/g, '-')}-forecast.json`;
          mimeType = 'application/json';
          break;

        case 'pdf':
          // For PDF, we'd typically use a library like jsPDF or Puppeteer
          // For now, we'll create a simple text-based report
          content = generatePDFContent();
          filename = `${productName.toLowerCase().replace(/\s+/g, '-')}-forecast-report.txt`;
          mimeType = 'text/plain';
          break;

        case 'png':
          // For PNG, we'd capture the chart using html2canvas
          // For now, we'll show a placeholder
          toast.info('PNG export would capture chart visualization');
          setIsExporting(false);
          return;

        default:
          throw new Error('Unsupported export format');
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Forecast exported as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDFContent = () => {
    return `
AGRI PREDICT FORECAST REPORT
============================

Product: ${productName}
Generated: ${new Date().toLocaleString()}
Scenario: ${forecastData.scenario || 'Realistic'}
Confidence: ${Math.round((forecastData.confidence || 0) * 100)}%

FORECAST SUMMARY
${forecastData.summary}

KEY METRICS
- Total Forecast Days: ${forecastData.metadata?.forecastHorizon || 'N/A'}
- Average Daily Demand: ${Math.round(forecastData.forecastData.reduce((sum, d) => sum + d.predictedValue, 0) / forecastData.forecastData.length)}
- Peak Demand: ${Math.max(...forecastData.forecastData.map(d => d.predictedValue))}
- Models Used: ${forecastData.modelsUsed?.join(', ') || 'N/A'}

REVENUE PROJECTION
${forecastData.revenueProjection?.map(r =>
  `${new Date(r.date).toLocaleDateString('en-GB')}: $${r.projectedRevenue.toLocaleString()} (${r.projectedQuantity} units)`
).join('\n') || 'No revenue data available'}

DETAILED FORECAST
${forecastData.forecastData.map(d =>
  `${new Date(d.date).toLocaleDateString('en-GB')}: ${d.predictedValue} units${d.confidenceLower ? ` (Range: ${d.confidenceLower}-${d.confidenceUpper})` : ''}`
).join('\n')}

---
Generated by AgriPredict Platform
    `.trim();
  };

  const handleShare = () => {
    const shareData = {
      title: `${productName} Forecast Report`,
      text: `Check out this forecast for ${productName} generated by AgriPredict`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      toast.success('Link copied to clipboard');
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${productName} Forecast Report`);
    const body = encodeURIComponent(`
Check out this forecast report for ${productName}:

${forecastData.summary}

View full report: ${window.location.href}
    `);

    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Forecast Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exportFormats.map((format) => (
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

          {/* Export Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-summary"
                checked={includeSummary}
                onCheckedChange={(checked) => setIncludeSummary(checked === true)}
              />
              <label htmlFor="include-summary" className="text-sm cursor-pointer">
                Include AI summary and insights
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-confidence"
                checked={includeConfidence}
                onCheckedChange={(checked) => setIncludeConfidence(checked === true)}
              />
              <label htmlFor="include-confidence" className="text-sm cursor-pointer">
                Include confidence intervals
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-charts"
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(checked === true)}
              />
              <label htmlFor="include-charts" className="text-sm cursor-pointer">
                Include chart visualizations
              </label>
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              'Exporting...'
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export as {exportFormats.find(f => f.id === exportFormat)?.name}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" onClick={handleShare} className="flex items-center">
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>

            <Button variant="outline" onClick={handleEmail} className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Email Report
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.info('Print functionality would open print dialog')}
              className="flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export History & Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Weekly Summary Report</p>
                <p className="text-sm text-muted-foreground">Exported 2 days ago • CSV format</p>
              </div>
              <Badge variant="secondary">Ready</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Monthly Forecast</p>
                <p className="text-sm text-muted-foreground">Exported 1 week ago • PDF format</p>
              </div>
              <Badge variant="secondary">Ready</Badge>
            </div>

            <Button variant="ghost" className="w-full mt-3">
              View All Exports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
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
    </div>
  );
}
