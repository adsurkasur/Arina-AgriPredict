import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { PlusCircle, Calendar } from 'lucide-react';
import { useCreateDemand } from '@/hooks/useApiHooks';
import { CreateDemandRequest } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type FormData = {
  date: Date | undefined;
  productName: string;
  quantity: number | undefined;
  price: number | undefined;
};

export function InlineAddRow() {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const createMutation = useCreateDemand();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'all', // Changed from 'onChange' to 'all' to trigger validation on all events
    defaultValues: {
      date: undefined,
      productName: '',
      quantity: undefined,
      price: undefined,
    },
  });

  const selectedDate = watch('date');

  useEffect(() => {
    if (selectedDate) {
      setValue('date', selectedDate, { shouldValidate: true });
    }
  }, [selectedDate, setValue]);

  const onSubmit = (data: FormData) => {
    if (!data.date) {
      // This shouldn't happen if validation is working, but as a safeguard
      return;
    }
    setPending(true);
  // ...existing code...
    const requestData: CreateDemandRequest = {
      date: data.date!.toISOString(),
      productName: data.productName,
      quantity: data.quantity!,
      price: data.price!,
    };
    createMutation.mutate(requestData, {
      onSuccess: () => {
        setPending(false);
  // ...existing code...
        reset();
        setTimeout(() => {
          firstFieldRef.current?.focus();
        }, 100);
      },
      onError: () => {
        setPending(false);
  // ...existing code...
        // Optionally repopulate form with previous data
      },
    });
  };

  const isPending = pending || createMutation.isPending;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <PlusCircle className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold">Add New Sales Record</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Hidden date input for validation */}
          <input
            type="hidden"
            {...register('date', { 
              validate: (value) => {
                if (!value || !(value instanceof Date)) {
                  return 'Date is required';
                }
                return true;
              }
            })}
          />            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs">Date</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                      errors.date && "border-destructive"
                    )}
                    disabled={isPending}
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
                      trigger('date');
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

            {/* Product Input */}
            <div className="space-y-2">
              <Label htmlFor="productName" className="text-xs">Product Name</Label>
              <Input
                id="productName"
                type="text"
                placeholder="Enter product name"
                disabled={isPending}
                className={cn(
                  "transition-smooth",
                  errors.productName && "border-destructive"
                )}
                {...register('productName', { 
                  validate: (value) => {
                    if (!value || value.trim() === '') {
                      return 'Product name is required';
                    }
                    return true;
                  }
                })}
                aria-required="true"
                aria-invalid={!!errors.productName}
              />
              {errors.productName && (
                <p className="text-xs text-destructive">{errors.productName.message}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-xs">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                disabled={isPending}
                className={cn(
                  "transition-smooth [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
                  errors.quantity && "border-destructive"
                )}
                {...register('quantity', { 
                  valueAsNumber: true, 
                  validate: (value) => {
                    if (value === undefined || value === null || (typeof value === 'number' && isNaN(value))) {
                      return 'Quantity is required';
                    }
                    if (value < 0) {
                      return 'Quantity must be at least 0';
                    }
                    return true;
                  }
                })}
                aria-required="true"
                aria-invalid={!!errors.quantity}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-xs">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                disabled={isPending}
                className={cn(
                  "transition-smooth [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
                  errors.price && "border-destructive"
                )}
                {...register('price', { 
                  valueAsNumber: true, 
                  validate: (value) => {
                    if (value === undefined || value === null || isNaN(value)) {
                      return 'Price is required';
                    }
                    if (value < 0) {
                      return 'Price must be at least 0';
                    }
                    return true;
                  }
                })}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-end justify-start md:col-span-1 col-span-1">
              <Button
                type="submit"
                disabled={!isValid || isPending}
                className="w-full md:w-auto transition-smooth"
                aria-disabled={!isValid || isPending}
                aria-label="Add sales record"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {isPending ? 'Adding...' : 'Add Record'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}