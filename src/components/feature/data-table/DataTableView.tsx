import { format } from 'date-fns';
import { DemandRecord } from '@/types/api';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EditDemandDialog } from './EditDemandDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';



interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableViewProps {
  data: DemandRecord[];
  sortConfig?: SortConfig;
  onSort?: (_key: string) => void;
}

export function DataTableView({ data }: DataTableViewProps) {

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
                className="transition-smooth hover:bg-muted/50"
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
                    <EditDemandDialog record={record} />
                    <DeleteConfirmationDialog record={record} />
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