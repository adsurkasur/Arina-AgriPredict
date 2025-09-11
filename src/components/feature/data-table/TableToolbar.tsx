import { Search, Filter, Download, Upload, X, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { demandsApi } from '@/lib/api-client';
import { CreateDemandRequest } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';
import { GenericDeleteConfirmationDialog } from '@/components/common/GenericDeleteConfirmationDialog';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (_value: string) => void;
  totalItems: number;
  data?: any[]; // Add data prop for export
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    priceMin?: number;
    priceMax?: number;
    quantityMin?: number;
    quantityMax?: number;
    productIds?: string[];
  };
  onFiltersChange?: (_filters: any) => void;
}

export function TableToolbar({ 
  searchValue, 
  onSearchChange, 
  totalItems,
  data = [],
  filters = {},
  onFiltersChange
}: TableToolbarProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const handleExport = () => {
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

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  // Helper function to validate CSV file type
  const validateCsvFile = (file: File): boolean => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error("Invalid file type", {
        description: "Please select a CSV file."
      });
      return false;
    }
    return true;
  };

  // Helper function to determine import strategy based on file size
  const determineImportStrategy = (fileSizeMB: number): 'bulk' | 'regular' => {
    return fileSizeMB > 1 ? 'bulk' : 'regular';
  };

  // Helper function to check if file should use bulk import based on row count
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateCsvFile(file)) return;

    const fileSizeMB = file.size / (1024 * 1024);
    const strategy = determineImportStrategy(fileSizeMB);

    if (strategy === 'bulk') {
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

  // Helper function to validate CSV headers
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

  // Helper function to validate and parse CSV row data
  const validateAndParseRow = (values: string[]): CreateDemandRequest | null => {
    if (values.length !== 4) return null;

    const [dateStr, productName, quantityStr, priceStr] = values;

    const date = new Date(dateStr);
    const quantity = parseInt(quantityStr);
    const price = parseFloat(priceStr);

    if (isNaN(date.getTime()) || isNaN(quantity) || isNaN(price) ||
        quantity <= 0 || price <= 0 || !Number.isInteger(quantity)) {
      return null;
    }

    return {
      date: date.toISOString(),
      productName,
      quantity,
      price,
      unit: 'kg'
    };
  };

  // Helper function to process individual CSV rows
  const processCsvRows = async (dataRows: string[]): Promise<{ successCount: number; errorCount: number }> => {
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

  const handleRegularImportProcess = async (csvText: string) => {
    setIsImporting(true);
    try {
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
      const { successCount, errorCount } = await processCsvRows(dataRows);

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
    } catch {
      toast.error("Import failed", {
        description: "Failed to read the CSV file. Please try again."
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBulkImportProcess = async (file: File) => {
    setIsImporting(true);

    try {
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

    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error("Bulk import failed", {
        description: error instanceof Error ? error.message : "Failed to import data"
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearData = async () => {
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

  const handleApplyFilters = () => {
    if (onFiltersChange) {
      onFiltersChange(localFilters);
    }
    // Keep popup open after applying filters
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
    // Keep popup open after clearing filters
  };

  const updateFilter = (key: string, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  // Helper function to check if a filter value is active
  const isFilterActive = (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null;
  };

  // Helper function to count only active filters
  const getActiveFilterCount = () => {
    const filterFields = [
      localFilters.dateFrom,
      localFilters.dateTo,
      localFilters.priceMin,
      localFilters.priceMax,
      localFilters.quantityMin,
      localFilters.quantityMax,
      localFilters.productIds
    ];

    return filterFields.filter(isFilterActive).length;
  };

  return (
    <div className="flex items-center justify-between space-x-4" role="toolbar" aria-label="Table controls">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative w-64 mr-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            type="text"
            placeholder="Search products, dates..."
            value={searchValue}
            onChange={(e) => {
              onSearchChange(e.target.value);
            }}
            className="pl-10 transition-smooth"
            aria-label="Search sales records"
            role="searchbox"
          />
        </div>
        
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="transition-smooth" aria-label="Open filters">
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs font-medium min-w-[18px] h-5 flex items-center justify-center">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                <PopoverPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </PopoverPrimitive.Close>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">From</Label>
                      <Input
                        type="date"
                        value={localFilters.dateFrom || ''}
                        onChange={(e) => updateFilter('dateFrom', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">To</Label>
                      <Input
                        type="date"
                        value={localFilters.dateTo || ''}
                        onChange={(e) => updateFilter('dateTo', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Price Range ($)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Min</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={localFilters.priceMin || ''}
                        onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                        className="h-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Max</Label>
                      <Input
                        type="number"
                        placeholder=""
                        value={localFilters.priceMax || ''}
                        onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                        className="h-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quantity Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Min</Label>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        value={localFilters.quantityMin || ''}
                        onChange={(e) => updateFilter('quantityMin', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="h-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Max</Label>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder=""
                        value={localFilters.quantityMax || ''}
                        onChange={(e) => updateFilter('quantityMax', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="h-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear
                </Button>
                <Button size="sm" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center space-x-4">
        <Badge variant="secondary" className="text-xs" aria-label={`Total records: ${totalItems}`}>
          {totalItems} records
        </Badge>
        
        <Button variant="outline" size="sm" onClick={handleImport} disabled={isImporting} className="transition-smooth" aria-label="Import sales data">
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          {isImporting ? 'Importing...' : 'Import'}
        </Button>

        <Button variant="outline" size="sm" onClick={handleExport} className="transition-smooth" aria-label="Export sales data">
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
          onConfirm={handleClearData}
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
      </div>

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
}