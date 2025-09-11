import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FormField } from './FormField';

interface UnitFieldProps {
  error?: string;
  disabled?: boolean;
  register: any;
  validation: any;
}

export function UnitField({
  error,
  disabled = false,
  register,
  validation
}: UnitFieldProps) {
  return (
    <FormField
      label="Unit"
      id="edit-unit"
      error={error}
    >
      <Input
        id="edit-unit"
        type="text"
        placeholder="pcs"
        disabled={disabled}
        className={cn(
          "transition-smooth",
          error && "border-destructive"
        )}
        {...register('unit', {
          validate: validation.validateUnit
        })}
        aria-required="true"
        aria-invalid={!!error}
      />
    </FormField>
  );
}
