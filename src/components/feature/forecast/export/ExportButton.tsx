import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ExportButtonProps, ExportFormat } from './types';

export const ExportButton: React.FC<ExportButtonProps> = ({
  format,
  formats,
  isExporting,
  onExport
}) => {
  const selectedFormat = formats.find((f: ExportFormat) => f.id === format);

  return (
    <Button
      onClick={onExport}
      disabled={isExporting}
      className="w-full"
      size="lg"
    >
      {isExporting ? (
        'Exporting...'
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export as {selectedFormat?.name}
        </>
      )}
    </Button>
  );
};
