import { format } from 'date-fns';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit2, Trash2 } from 'lucide-react';
import { DemandRecord } from '@/types/api';
import { useDeleteDemand } from '@/hooks/useApiHooks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type PendingRow = {
  date: Date;
  productId: string;
  quantity: number;
  price: number;
};

interface DataTableViewProps {
  data: DemandRecord[];
  sortConfig: {
    key: string;
    direction: 'asc' | 'desc';
  } | null;
  onSort: (key: string) => void;
  pendingRow?: PendingRow | null;
}

interface SortHeaderProps {
  label: string;
  sortKey: string;
  currentSort: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
}

function SortHeader({ label, sortKey, currentSort, onSort }: SortHeaderProps) {
  const isActive = currentSort?.key === sortKey;
  const direction = isActive ? currentSort.direction : null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(sortKey)}
      className="h-8 px-2 font-semibold text-left justify-start"
    >
      {label}
      {direction === 'asc' && <ArrowUp className="ml-2 h-3 w-3" />}
      {direction === 'desc' && <ArrowDown className="ml-2 h-3 w-3" />}
      {!direction && <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />}
    </Button>
  );
}

export function DataTableView({ data, sortConfig, onSort, pendingRow }: DataTableViewProps) {
  const deleteMutation = useDeleteDemand();

  // Accept pendingRow prop for optimistic UI
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
          {/* Pending row for optimistic UI */}
          {pendingRow && (
            <TableRow
              key="pending"
              className="animate-pulse opacity-60 bg-primary/10"
              aria-live="polite"
            >
              <TableCell className="font-medium">
                {format(pendingRow.date, 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Pending...</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                {pendingRow.quantity.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(pendingRow.price)}
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {formatCurrency(pendingRow.quantity * pendingRow.price)}
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">Pending...</span>
              </TableCell>
            </TableRow>
          )}
          {/* ...existing code... */}
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