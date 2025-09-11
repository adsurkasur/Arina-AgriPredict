import { Label } from '@/components/ui/label';
import { FormFieldProps } from './types';

export function FormField({
  label,
  id,
  error,
  children
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
