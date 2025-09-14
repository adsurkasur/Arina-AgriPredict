import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FormField } from './FormField';

interface PriceFieldProps {
  error?: string;
  disabled?: boolean;
  register: any;
  validation: any;
}

export function PriceField({
  error,
  disabled = false,
  register,
  validation
}: PriceFieldProps) {
  return (
    <FormField
      label="Price (Rp)"
      id="edit-price"
      error={error}
    >
      <Input
        id="edit-price"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        disabled={disabled}
        className={cn(
          "transition-smooth [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
          error && "border-destructive"
        )}
        {...register('price', {
          valueAsNumber: true,
          validate: validation.validatePrice
        })}
        aria-required="true"
        aria-invalid={!!error}
      />
    </FormField>
  );
}
