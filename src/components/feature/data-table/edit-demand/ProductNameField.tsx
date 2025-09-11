import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FormField } from './FormField';

interface ProductNameFieldProps {
  error?: string;
  disabled?: boolean;
  register: any;
  validation: any;
}

export function ProductNameField({
  error,
  disabled = false,
  register,
  validation
}: ProductNameFieldProps) {
  return (
    <FormField
      label="Product Name"
      id="edit-productName"
      error={error}
    >
      <Input
        id="edit-productName"
        type="text"
        placeholder="Enter product name"
        disabled={disabled}
        className={cn(
          "transition-smooth",
          error && "border-destructive"
        )}
        {...register('productName', {
          validate: validation.validateProductName
        })}
        aria-required="true"
        aria-invalid={!!error}
      />
    </FormField>
  );
}
