import { format } from 'date-fns';
import { DemandRecord } from '@/types/api';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EditDemandDialog } from './edit-demand';
import { GenericDeleteConfirmationDialog } from '@/components/common/GenericDeleteConfirmationDialog';
import { useDeleteDemand } from '@/hooks/useApiHooks';
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';



interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableViewProps {
  data: DemandRecord[];
  sortConfig?: SortConfig;
  onSort?: (_key: string) => void;
}

export function DataTableView({ data, sortConfig, onSort }: DataTableViewProps) {
  const deleteMutation = useDeleteDemand();

  // Compact date formatting for table display
  const formatCompactDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    // Use dd/mm/yyyy format for display
    return `${day}/${month}/${year}`;
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const handleSort = (columnKey: string) => {
    if (onSort) {
      onSort(columnKey);
    }
  };

  // ...existing code...

  return (
    <div className="rounded-md border" role="table" aria-label="Sales Data Table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium hover:bg-transparent hover:text-primary"
                onClick={() => handleSort('date')}
              >
                Date
                {getSortIcon('date')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium hover:bg-transparent hover:text-primary"
                onClick={() => handleSort('productName')}
              >
                Product
                {getSortIcon('productName')}
              </Button>
            </TableHead>
            <TableHead className="text-right w-[100px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium hover:bg-transparent hover:text-primary"
                onClick={() => handleSort('quantity')}
              >
                Quantity
                {getSortIcon('quantity')}
              </Button>
            </TableHead>
            <TableHead className="w-[80px]">Unit</TableHead>
            <TableHead className="text-right w-[100px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium hover:bg-transparent hover:text-primary"
                onClick={() => handleSort('price')}
              >
                Price
                {getSortIcon('price')}
              </Button>
            </TableHead>
            <TableHead className="text-right w-[120px]">Total</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((record) => {
              const total = record.quantity * record.price;
              return (
                <TableRow
                  key={record.id}
                  className="transition-smooth hover:bg-muted/50"
                >
                  <TableCell className="font-medium min-w-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate max-w-[120px]">
                            {formatCompactDate(new Date(record.date))}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{format(new Date(record.date), 'dd/MM/yyyy')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="font-medium truncate" title={record.productName}>
                        {record.productName}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {record.productId}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {record.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {record.unit || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(record.price)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(total)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <EditDemandDialog record={record} />
                      <GenericDeleteConfirmationDialog
                        title="Delete Sales Record"
                        description="Are you sure you want to delete this sales record? This action cannot be undone."
                        itemName={record.productName}
                        itemDetails={[
                          `Quantity: ${record.quantity}`,
                          `Unit: ${record.unit || 'N/A'}`,
                          `Price: ${formatCurrency(record.price)}`,
                          `Date: ${format(new Date(record.date), 'dd/MM/yyyy')}`
                        ]}
                        confirmText="Delete Record"
                        mutation={deleteMutation}
                        itemId={record.id}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-white hover:scale-110 transition-all duration-200 hover:shadow-sm"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}