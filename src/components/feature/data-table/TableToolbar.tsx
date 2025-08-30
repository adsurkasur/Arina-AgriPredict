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
    <div className="flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products, dates..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 transition-smooth"
          />
        </div>
        
        <Button variant="outline" size="sm" className="transition-smooth">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Badge variant="secondary" className="text-xs">
          {totalItems} records
        </Badge>
        
        <Button variant="outline" size="sm" onClick={handleExport} className="transition-smooth">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}