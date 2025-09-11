import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, FileSpreadsheet, FileJson, Image } from 'lucide-react';
import { toast } from '@/lib/toast';
import { ExportCapabilitiesProps, ExportFormat } from './types';
import { useExportState, useDataGenerators, useFileDownload, useQuickActions } from './hooks';
import { FormatSelector } from './FormatSelector';
import { ExportOptions } from './ExportOptions';
import { ExportButton } from './ExportButton';
import { QuickActions } from './QuickActions';
import { ExportHistory } from './ExportHistory';
import { DataPreview } from './DataPreview';

export const ExportCapabilities: React.FC<ExportCapabilitiesProps> = ({
  forecastData,
  productName = 'Product'
}) => {
  const {
    exportFormat,
    options,
    isExporting,
    setExportFormat,
    setOptions,
    setIsExporting
  } = useExportState();

  const { generateCSV, generateJSON, generatePDFContent } = useDataGenerators(
    forecastData,
    productName,
    options
  );

  const { downloadFile } = useFileDownload();
  const { handleShare, handleEmail } = useQuickActions(productName, forecastData);

  const exportFormats: ExportFormat[] = [
    { id: 'csv', name: 'CSV', icon: FileSpreadsheet, description: 'Excel-compatible spreadsheet' },
    { id: 'json', name: 'JSON', icon: FileJson, description: 'Structured data format' },
    { id: 'pdf', name: 'PDF Report', icon: FileText, description: 'Formatted report with charts' },
    { id: 'png', name: 'PNG Image', icon: Image, description: 'Chart visualization' }
  ];

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
          content = generatePDFContent();
          filename = `${productName.toLowerCase().replace(/\s+/g, '-')}-forecast-report.txt`;
          mimeType = 'text/plain';
          break;

        case 'png':
          toast.info('PNG export would capture chart visualization');
          setIsExporting(false);
          return;

        default:
          throw new Error('Unsupported export format');
      }

      downloadFile(content, filename, mimeType);
      toast.success(`Forecast exported as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
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
          <FormatSelector
            formats={exportFormats}
            selectedFormat={exportFormat}
            onFormatChange={setExportFormat}
          />

          <ExportOptions
            options={options}
            onOptionsChange={setOptions}
          />

          <ExportButton
            format={exportFormat}
            formats={exportFormats}
            isExporting={isExporting}
            onExport={handleExport}
          />
        </CardContent>
      </Card>

      <QuickActions
        onShare={handleShare}
        onEmail={handleEmail}
      />

      <ExportHistory />

      <DataPreview
        forecastData={forecastData}
        includeConfidence={options.includeConfidence}
      />
    </div>
  );
};
