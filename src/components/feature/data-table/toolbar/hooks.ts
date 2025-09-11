import { useState, useRef } from 'react';
import { toast } from '@/lib/toast';
import { demandsApi } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { TableFilters, CsvRowData, ImportResult, ImportStrategy } from './types';

export const useImportState = () => {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return { isImporting, setIsImporting, fileInputRef };
};

export const useFilters = (initialFilters: TableFilters = {}) => {
  const [filters, setFilters] = useState<TableFilters>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = (onFiltersChange?: (_filters: TableFilters) => void) => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  };

  const clearFilters = (onFiltersChange?: (_filters: TableFilters) => void) => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  };

  const getActiveFilterCount = () => {
    const filterFields = [
      filters.dateFrom,
      filters.dateTo,
      filters.priceMin,
      filters.priceMax,
      filters.quantityMin,
      filters.quantityMax,
      filters.productIds
    ];

    return filterFields.filter(isFilterActive).length;
  };

  const isFilterActive = (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null;
  };

  return {
    filters,
    isOpen,
    setIsOpen,
    updateFilter,
    applyFilters,
    clearFilters,
    getActiveFilterCount
  };
};

export const useCsvValidation = () => {
  const validateCsvFile = (file: File): boolean => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error("Invalid file type", {
        description: "Please select a CSV file."
      });
      return false;
    }
    return true;
  };

  const validateCsvHeaders = (headers: string[]): boolean => {
    const expectedHeaders = ['Date', 'Product', 'Quantity', 'Price'];
    if (!expectedHeaders.every(header => headers.includes(header))) {
      toast.error("Invalid CSV format", {
        description: "CSV must have columns: Date, Product, Quantity, Price"
      });
      return false;
    }
    return true;
  };

  const validateAndParseRow = (values: string[]): CsvRowData | null => {
    if (values.length !== 4) return null;

    const [dateStr, productName, quantityStr, priceStr] = values;

    const date = new Date(dateStr);
    const quantity = parseInt(quantityStr);
    const price = parseFloat(priceStr);

    // Validate date
    if (isNaN(date.getTime())) return null;

    // Validate quantity
    if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) return null;

    // Validate price
    if (isNaN(price) || price <= 0) return null;

    return {
      date: date.toISOString(),
      productName,
      quantity,
      price,
      unit: 'kg'
    };
  };

  return { validateCsvFile, validateCsvHeaders, validateAndParseRow };
};

export const useImportStrategy = () => {
  const determineImportStrategy = (fileSizeMB: number): ImportStrategy => {
    return fileSizeMB > 1
      ? { type: 'bulk', reason: 'File size exceeds 1MB' }
      : { type: 'regular', reason: 'File size is manageable' };
  };

  const shouldUseBulkImport = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      return lines.length > 101; // 100 data rows + 1 header
    } catch (error) {
      console.warn('Failed to read file for size check, using bulk import:', error);
      return true; // Fall back to bulk import if reading fails
    }
  };

  return { determineImportStrategy, shouldUseBulkImport };
};

export const useDataImport = () => {
  const queryClient = useQueryClient();

  const processCsvRows = async (dataRows: string[], validateAndParseRow: (_values: string[]) => CsvRowData | null): Promise<ImportResult> => {
    let successCount = 0;
    let errorCount = 0;

    for (const row of dataRows) {
      try {
        const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const importData = validateAndParseRow(values);

        if (!importData) {
          errorCount++;
          continue;
        }

        await demandsApi.createDemand(importData);
        successCount++;
      } catch {
        errorCount++;
      }
    }

    return { successCount, errorCount };
  };

  const handleRegularImport = async (
    csvText: string,
    validateCsvHeaders: (_headers: string[]) => boolean,
    validateAndParseRow: (_values: string[]) => CsvRowData | null
  ): Promise<void> => {
    const lines = csvText.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      toast.error("Invalid CSV format", {
        description: "CSV file must contain headers and at least one data row."
      });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    if (!validateCsvHeaders(headers)) return;

    const dataRows = lines.slice(1);
    const { successCount, errorCount } = await processCsvRows(dataRows, validateAndParseRow);

    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      toast.success("Import completed", {
        description: `Successfully imported ${successCount} records. ${errorCount > 0 ? `${errorCount} records failed.` : ''}`
      });
    } else {
      toast.error("Import failed", {
        description: "No valid records were found in the CSV file."
      });
    }
  };

  const handleBulkImport = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/bulk-import', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Bulk import failed');
    }

    // Invalidate and refetch demands data
    queryClient.invalidateQueries({ queryKey: ['demands'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });

    toast.success("Bulk import completed", {
      description: `Successfully imported ${result.data.processed} records from ${result.data.totalRows} rows.`
    });
  };

  return { processCsvRows, handleRegularImport, handleBulkImport };
};

export const useDataExport = () => {
  const handleExport = (data: any[]) => {
    try {
      if (data.length === 0) {
        toast.warning("No data to export", {
          description: "There are no records to export."
        });
        return;
      }

      // Create CSV content
      const headers = ['Date', 'Product', 'Quantity', 'Price'];
      const csvContent = [
        headers.join(','),
        ...data.map(row => [
          row.date,
          `"${row.productName}"`,
          row.quantity,
          row.price
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sales-data-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data exported successfully", {
        description: `Exported ${data.length} records to CSV file.`
      });
    } catch {
      toast.error("Export failed", {
        description: "Failed to export data. Please try again."
      });
    }
  };

  return { handleExport };
};

export const useDataClear = () => {
  const queryClient = useQueryClient();

  const handleClearData = async (): Promise<void> => {
    try {
      const response = await fetch('/api/demands/clear-all', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to clear data');
      }

      // Refresh the data and products
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      toast.success("All data cleared successfully", {
        description: `Deleted ${result.data.deletedCount} records from the database.`
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error("Failed to clear data", {
        description: error instanceof Error ? error.message : "Some records may not have been deleted. Please try again."
      });
    }
  };

  return { handleClearData };
};
