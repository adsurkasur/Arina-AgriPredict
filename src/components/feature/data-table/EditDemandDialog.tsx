import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar, Edit2 } from 'lucide-react';
import { DemandRecord, UpdateDemandRequest } from '@/types/api';
import { useUpdateDemand } from '@/hooks/useApiHooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

const formSchema = z.object({
  date: z.date({
    message: "Please select a date",
  }),
  productName: z.string().min(1, "Please enter a product name"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  price: z.number().min(0.01, "Price must be greater than 0"),
});

type FormData = z.infer<typeof formSchema>;

interface EditDemandDialogProps {
  record: DemandRecord;
  trigger?: React.ReactNode;
}

export function EditDemandDialog({ record, trigger }: EditDemandDialogProps) {
  const [open, setOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const updateMutation = useUpdateDemand();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      date: new Date(record.date),
      productName: record.productName,
      quantity: record.quantity,
      price: record.price,
    },
  });

  const selectedDate = watch('date');

  // Reset form when dialog opens with new record data
  useEffect(() => {
    if (open) {
      reset({
        date: new Date(record.date),
        productName: record.productName,
        quantity: record.quantity,
        price: record.price,
      });
    }
  }, [open, record, reset]);

  const onSubmit = (data: FormData) => {
    const updateData: UpdateDemandRequest = {
      date: data.date.toISOString(),
      productName: data.productName,
      quantity: data.quantity,
      price: data.price,
    };

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
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setOpen(false);
      }
    } else {
      setOpen(false);
    }
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="edit-date" className="text-sm font-medium">
              Date
            </Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="edit-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                    errors.date && "border-destructive"
                  )}
                  disabled={updateMutation.isPending}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setValue('date', date!, { shouldValidate: true });
                    setDatePickerOpen(false);
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-productName" className="text-sm font-medium">
              Product Name
            </Label>
            <Input
              id="edit-productName"
              type="text"
              placeholder="Enter product name"
              disabled={updateMutation.isPending}
              className={cn(
                "transition-smooth",
                errors.productName && "border-destructive"
              )}
              {...register('productName')}
              aria-required="true"
              aria-invalid={!!errors.productName}
            />
            {errors.productName && (
              <p className="text-xs text-destructive">{errors.productName.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="edit-quantity" className="text-sm font-medium">
              Quantity
            </Label>
            <Input
              id="edit-quantity"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              disabled={updateMutation.isPending}
              className={cn(
                "transition-smooth",
                errors.quantity && "border-destructive"
              )}
              {...register('quantity', { valueAsNumber: true })}
              aria-required="true"
              aria-invalid={!!errors.quantity}
            />
            {errors.quantity && (
              <p className="text-xs text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="edit-price" className="text-sm font-medium">
              Price ($)
            </Label>
            <Input
              id="edit-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              disabled={updateMutation.isPending}
              className={cn(
                "transition-smooth",
                errors.price && "border-destructive"
              )}
              {...register('price', { valueAsNumber: true })}
              aria-required="true"
              aria-invalid={!!errors.price}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || updateMutation.isPending || !isDirty}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
