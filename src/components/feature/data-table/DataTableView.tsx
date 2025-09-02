import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';
import { DemandRecord } from '@/types/api';
import { useDeleteDemand } from '@/hooks/useApiHooks';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';



interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableViewProps {
  data: DemandRecord[];
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
}

export function DataTableView({ data, sortConfig: _sortConfig, onSort }: DataTableViewProps) {
  const deleteMutation = useDeleteDemand();

  // ...existing code...

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // ...existing code...

  return (
    <div className="rounded-md border" role="table" aria-label="Sales Data Table">
      <Table>
        <TableHeader>
          <TableRow>
            {/* ...existing code... */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record) => {
            const total = record.quantity * record.price;
            return (
              <TableRow
                key={record.id}
                className={cn(
                  "transition-smooth hover:bg-muted/50",
                  deleteMutation.isPending && "opacity-50"
                )}
              >
                <TableCell className="font-medium">
                  {format(new Date(record.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{record.productName}</span>
                    <Badge variant="outline" className="text-xs">
                      {record.productId}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {record.quantity.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(record.price)}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatCurrency(total)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={deleteMutation.isPending}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(record.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}