import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FormField } from './FormField';

interface QuantityFieldProps {
  error?: string;
  disabled?: boolean;
  register: any;
  validation: any;
}

export function QuantityField({
  error,
  disabled = false,
  register,
  validation
}: QuantityFieldProps) {
  return (
    <FormField
      label="Quantity"
      id="edit-quantity"
      error={error}
    >
      <Input
        id="edit-quantity"
        type="number"
        step="1"
        min="0"
        placeholder="0"
        disabled={disabled}
        className={cn(
          "transition-smooth [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
          error && "border-destructive"
        )}
        {...register('quantity', {
          valueAsNumber: true,
          validate: validation.validateQuantity
        })}
        aria-required="true"
        aria-invalid={!!error}
      />
    </FormField>
  );
}
