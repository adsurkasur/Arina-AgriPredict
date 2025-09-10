import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { DemandRecord } from '@/types/api';
import { useDeleteDemand } from '@/hooks/useApiHooks';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';

interface DeleteConfirmationDialogProps {
  record: DemandRecord;
  trigger?: React.ReactNode;
  onDelete?: () => void;
}

export function DeleteConfirmationDialog({
  record,
  trigger,
  onDelete
}: DeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteDemand();

  const handleDelete = () => {
    toast.info("Deleting record", {
      description: "Record deletion in progress..."
    });

    deleteMutation.mutate(record.id, {
      onSuccess: () => {
        toast.success("Record deleted", {
          description: "Sales record has been deleted successfully."
        });
        setOpen(false);
        onDelete?.();
      },
      onError: (error: any) => {
        toast.error("Delete failed", {
          description: error?.message || "Failed to delete the record."
        });
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Sales Record</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this sales record? This action cannot be undone.
            <br />
            <br />
            <strong>Record Details:</strong>
            <br />
            • Product: {record.productName}
            <br />
            • Quantity: {record.quantity}
            <br />
            • Price: ${record.price}
            <br />
            • Date: {new Date(record.date).toLocaleDateString()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Record'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
