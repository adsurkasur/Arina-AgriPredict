import { useState } from 'react';
import { Trash2 } from 'lucide-react';
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

interface GenericDeleteConfirmationDialogProps {
  title: string;
  description: string;
  itemName: string;
  itemDetails?: string[];
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  mutation?: {
    mutate: (_id: string, _options?: any) => void;
    isPending: boolean;
  };
  itemId?: string;
  trigger?: React.ReactNode;
  isLoading?: boolean;
}

export function GenericDeleteConfirmationDialog({
  title,
  description,
  itemName,
  itemDetails = [],
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  mutation,
  itemId,
  trigger,
  isLoading = false
}: GenericDeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (mutation && itemId) {
      // Use React Query mutation pattern
      mutation.mutate(itemId, {
        onSuccess: () => {
          setOpen(false);
        },
        onError: () => {
          // Error handling is done in the mutation hook
        },
      });
    } else if (onConfirm) {
      // Use direct async function pattern
      try {
        await onConfirm();
        setOpen(false);
      } catch (error) {
        // Error handling is done in the onConfirm function
        console.error('Delete operation failed:', error);
      }
    }
  };

  const loadingState = mutation?.isPending || isLoading;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-white hover:scale-110 transition-all duration-200 hover:shadow-sm"
            disabled={loadingState}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            <br />
            <br />
            <strong>Item Details:</strong>
            <br />
            • Name: {itemName}
            {itemDetails.map((detail, index) => (
              <span key={index}>
                <br />
                • {detail}
              </span>
            ))}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loadingState}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loadingState}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {loadingState ? 'Deleting...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
