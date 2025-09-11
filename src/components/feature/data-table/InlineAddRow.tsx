import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { PlusCircle, Calendar, Bot } from 'lucide-react';
import { useCreateDemand } from '@/hooks/useApiHooks';
import { useProducts } from '@/hooks/useApiHooks';
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
  unit: string;
};

export function InlineAddRow() {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const createMutation = useCreateDemand();
  const { data: availableProducts = [] } = useProducts();
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
      unit: '',
    },
  });

  const selectedDate = watch('date');
  const productNameValue = watch('productName');

  // Memoize the selected date to prevent unnecessary re-renders of the Calendar component
  const memoizedSelectedDate = useMemo(() => {
    return selectedDate;
  }, [selectedDate]);

  // Generate smart defaults based on historical patterns
  const generateSmartDefaults = useCallback(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Set yesterday as default date for data entry
    setValue('date', yesterday, { shouldValidate: true });
    
    // Could add more smart defaults here based on historical data
    // For example: most common product, average prices, etc.
  }, [setValue]);

  // Apply smart defaults when component mounts
  useEffect(() => {
    generateSmartDefaults();
  }, [generateSmartDefaults]);

  // Generate product suggestions based on input
  const generateProductSuggestions = useCallback((input: string): string[] => {
    const lowerInput = input.toLowerCase();
    
    return availableProducts.filter(product => 
      product.name.toLowerCase().includes(lowerInput) || 
      product.name.toLowerCase().replace(/\s+/g, '').includes(lowerInput.replace(/\s+/g, ''))
    ).map(product => product.name).slice(0, 3);
  }, [availableProducts]);

  // Generate AI suggestions based on product name input
  useEffect(() => {
    if (productNameValue && productNameValue.length > 1) {
      // Generate smart suggestions based on input
      const suggestions = generateProductSuggestions(productNameValue);
      setAiSuggestions(suggestions);
      setShowAISuggestions(suggestions.length > 0);
    } else {
      setShowAISuggestions(false);
      setAiSuggestions([]);
    }
  }, [productNameValue, generateProductSuggestions]);

  // Handle AI suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setValue('productName', suggestion, { shouldValidate: true });
    setShowAISuggestions(false);
  };

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
      unit: data.unit || 'pcs', // Default to 'pcs' if not specified
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <PlusCircle className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Add New Sales Record</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                      !memoizedSelectedDate && "text-muted-foreground",
                      errors.date && "border-destructive"
                    )}
                    disabled={isPending}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {memoizedSelectedDate ? format(memoizedSelectedDate, "dd/MM/yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={memoizedSelectedDate}
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
              
              {/* AI Suggestions */}
              {showAISuggestions && aiSuggestions.length > 0 && (
                <div className="mt-2 p-2 bg-primary/5 rounded-md border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-primary">AI Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded border border-primary/20 transition-colors"
                        disabled={isPending}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
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

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-xs">Unit</Label>
              <Input
                id="unit"
                type="text"
                placeholder="pcs"
                disabled={isPending}
                className={cn(
                  "transition-smooth",
                  errors.unit && "border-destructive"
                )}
                {...register('unit', { 
                  validate: (value) => {
                    if (!value || value.trim() === '') {
                      return 'Unit is required';
                    }
                    return true;
                  }
                })}
                aria-required="true"
                aria-invalid={!!errors.unit}
              />
              {errors.unit && (
                <p className="text-xs text-destructive">{errors.unit.message}</p>
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
            <div className="flex justify-start md:col-span-1 col-span-1 pt-8">
              <Button
                type="submit"
                disabled={!isValid || isPending}
                className="w-full h-10 px-3 py-2 text-base md:text-sm transition-smooth"
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