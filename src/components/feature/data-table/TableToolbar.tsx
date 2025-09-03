import { Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';

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
        
        <Button variant="outline" size="sm" onClick={handleExport} className="transition-smooth" aria-label="Export sales data">
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Export
        </Button>
      </div>
    </div>
  );
}