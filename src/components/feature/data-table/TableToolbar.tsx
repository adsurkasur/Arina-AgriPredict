import { Search, Filter, Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { demandsApi } from '@/lib/api-client';
import { CreateDemandRequest } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';

interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (_value: string) => void;
  totalItems: number;
  data?: any[]; // Add data prop for export
}

export function TableToolbar({ 
  searchValue, 
  onSearchChange, 
  totalItems,
  data = []
}: TableToolbarProps) {
  const [isImporting, setIsImporting] = useState(false);
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error("Invalid file type", {
        description: "Please select a CSV file."
      });
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("Invalid CSV format", {
          description: "CSV file must contain headers and at least one data row."
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const expectedHeaders = ['Date', 'Product', 'Quantity', 'Price'];
      
      if (!expectedHeaders.every(header => headers.includes(header))) {
        toast.error("Invalid CSV format", {
          description: "CSV must have columns: Date, Product, Quantity, Price"
        });
        return;
      }

      const dataRows = lines.slice(1);
      let successCount = 0;
      let errorCount = 0;

      for (const row of dataRows) {
        try {
          const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          if (values.length !== 4) continue;

          const [dateStr, productName, quantityStr, priceStr] = values;
          
          // Parse and validate data
          const date = new Date(dateStr);
          const quantity = parseFloat(quantityStr);
          const price = parseFloat(priceStr);

          if (isNaN(date.getTime()) || isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
            errorCount++;
            continue;
          }

          const importData: CreateDemandRequest = {
            date: date.toISOString(),
            productName,
            quantity,
            price
          };

          await demandsApi.createDemand(importData);
          successCount++;
        } catch {
          errorCount++;
        }
      }

      if (successCount > 0) {
        // Invalidate and refetch demands data
        queryClient.invalidateQueries({ queryKey: ['demands'] });
        
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
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center justify-between space-x-4" role="toolbar" aria-label="Table controls">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            type="text"
            placeholder="Search products, dates..."
            value={searchValue}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (e.target.value.trim()) {
                toast.info("Searching records", {
                  description: `Looking for records containing "${e.target.value}"`
                });
              }
            }}
            className="pl-10 transition-smooth"
            aria-label="Search sales records"
            role="searchbox"
          />
        </div>
        
        <Button variant="outline" size="sm" className="transition-smooth" aria-label="Open filters">
          <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
          Filters
        </Button>
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