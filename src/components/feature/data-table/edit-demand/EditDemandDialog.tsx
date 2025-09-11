import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { useUpdateDemand } from '@/hooks/useApiHooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { EditDemandDialogProps } from './types';
import { EditDemandForm } from './EditDemandForm';

export function EditDemandDialog({ record, trigger }: EditDemandDialogProps) {
  const [open, setOpen] = useState(false);
  const updateMutation = useUpdateDemand();

  const handleSubmit = (updateData: any) => {
    updateMutation.mutate(
      { id: record.id, data: updateData },
      {
        onSuccess: () => {
          toast.success("Record updated", {
            description: "Sales record has been updated successfully."
          });
          setOpen(false);
        },
        onError: (error: any) => {
          toast.error("Update failed", {
            description: error?.message || "Failed to update the record."
          });
        },
      }
    );
  };

  const handleCancel = () => {
    if (updateMutation.isPending) return;

    // Check if form has unsaved changes - this would be handled by the form component
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={updateMutation.isPending}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Sales Record</DialogTitle>
          <DialogDescription>
            Make changes to the sales record below. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <EditDemandForm
          record={record}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
