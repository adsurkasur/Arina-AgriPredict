import React, { useRef, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { InlineAddRowProps } from './types';
import { useInlineAddForm } from './hooks';
import { DatePicker } from './DatePicker';
import { ProductInput } from './ProductInput';
import { NumericInput } from './NumericInput';
import { TextInput } from './TextInput';
import { SubmitButton } from './SubmitButton';

export const InlineAddRow: React.FC<InlineAddRowProps> = ({
  onSuccess,
  onError
}) => {
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    errors,
    isValid,
    selectedDate,
    productNameValue,
    suggestions,
    showSuggestions,
    isPending,
    handleSuggestionClick,
    onSubmit
  } = useInlineAddForm(onSuccess, onError);

  // Focus first field after successful submission
  useEffect(() => {
    if (!isPending) {
      const timer = setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPending]);

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
            />

            <DatePicker
              selectedDate={selectedDate}
              onDateChange={(date) => {
                setValue('date', date!, { shouldValidate: true });
                trigger('date');
              }}
              disabled={isPending}
              error={errors.date?.message}
            />

            <ProductInput
              value={productNameValue}
              onChange={(value) => setValue('productName', value, { shouldValidate: true })}
              suggestions={suggestions}
              showSuggestions={showSuggestions}
              onSuggestionClick={handleSuggestionClick}
              disabled={isPending}
              error={errors.productName?.message}
            />

            <NumericInput
              id="quantity"
              label="Quantity"
              value={undefined} // Controlled by react-hook-form
              onChange={(value) => setValue('quantity', value, { shouldValidate: true })}
              placeholder="0"
              min={0}
              step={1}
              disabled={isPending}
              error={errors.quantity?.message}
              required
            />

            <TextInput
              id="unit"
              label="Unit"
              value="" // Controlled by react-hook-form
              onChange={(value) => setValue('unit', value, { shouldValidate: true })}
              placeholder="pcs"
              disabled={isPending}
              error={errors.unit?.message}
              required
            />

            <NumericInput
              id="price"
              label="Price (Rp)"
              value={undefined} // Controlled by react-hook-form
              onChange={(value) => setValue('price', value, { shouldValidate: true })}
              placeholder="0.00"
              min={0}
              step={0.01}
              disabled={isPending}
              error={errors.price?.message}
              required
            />

            <SubmitButton
              isValid={isValid}
              isPending={isPending}
              onSubmit={() => {}} // Handled by form onSubmit
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
