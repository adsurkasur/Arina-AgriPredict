import { Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  totalItems: number;
}

export function TableToolbar({ 
  searchValue, 
  onSearchChange, 
  totalItems 
}: TableToolbarProps) {
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export data requested');
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
            onChange={(e) => onSearchChange(e.target.value)}
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