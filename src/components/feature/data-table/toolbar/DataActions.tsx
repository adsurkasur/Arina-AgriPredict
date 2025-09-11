import React from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GenericDeleteConfirmationDialog } from '@/components/common/GenericDeleteConfirmationDialog';
import { DataActionsProps } from './types';
import { useImportState, useCsvValidation, useImportStrategy, useDataImport, useDataExport, useDataClear } from './hooks';

export const DataActions: React.FC<DataActionsProps> = ({
  data,
  isImporting,
  totalItems
}) => {
  const { fileInputRef } = useImportState();
  const { validateCsvFile, validateCsvHeaders, validateAndParseRow } = useCsvValidation();
  const { determineImportStrategy, shouldUseBulkImport } = useImportStrategy();
  const { handleRegularImport, handleBulkImport } = useDataImport();
  const { handleExport } = useDataExport();
  const { handleClearData } = useDataClear();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateCsvFile(file)) return;

    const fileSizeMB = file.size / (1024 * 1024);
    const strategy = determineImportStrategy(fileSizeMB);

    if (strategy.type === 'bulk') {
      await handleBulkImportProcess(file);
      return;
    }

    // For smaller files, check row count to determine strategy
    const useBulk = await shouldUseBulkImport(file);
    if (useBulk) {
      await handleBulkImportProcess(file);
    } else {
      try {
        const text = await file.text();
        await handleRegularImportProcess(text);
      } catch (error) {
        console.warn('Failed to read file, falling back to bulk import:', error);
        await handleBulkImportProcess(file);
      }
    }
  };

  const handleRegularImportProcess = async (csvText: string) => {
    await handleRegularImport(csvText, validateCsvHeaders, validateAndParseRow);
  };

  const handleBulkImportProcess = async (file: File) => {
    try {
      await handleBulkImport(file);
    } catch (error) {
      console.error('Bulk import error:', error);
    }
  };

  const handleExportClick = () => {
    handleExport(data);
  };

  const handleClearClick = async () => {
    await handleClearData();
  };

  return (
    <div className="flex items-center space-x-4">
      <Badge variant="secondary" className="text-xs" aria-label={`Total records: ${totalItems}`}>
        {totalItems} records
      </Badge>

      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        disabled={isImporting}
        className="transition-smooth"
        aria-label="Import sales data"
      >
        <Download className="mr-2 h-4 w-4" aria-hidden="true" />
        {isImporting ? 'Importing...' : 'Import'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleExportClick}
        className="transition-smooth"
        aria-label="Export sales data"
      >
        <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
        Export
      </Button>

      <GenericDeleteConfirmationDialog
        title="Clear All Data"
        description="This will permanently delete ALL sales records from the entire database. This action cannot be undone."
        itemName="All Database Sales Data"
        itemDetails={[
          "This will delete ALL records from the database",
          "This includes data not currently displayed on screen",
          "All historical sales data will be permanently removed",
          "Action cannot be reversed"
        ]}
        confirmText="Delete All Data"
        cancelText="Cancel"
        onConfirm={handleClearClick}
        trigger={
          <Button
            variant="destructive"
            size="sm"
            className="transition-smooth text-white"
            aria-label="Clear all data"
            disabled={data.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Clear Data
          </Button>
        }
      />

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label="Import CSV file"
      />
    </div>
  );
};
