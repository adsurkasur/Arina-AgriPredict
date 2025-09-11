import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { NumericInputProps } from './types';

export const NumericInput: React.FC<NumericInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  min,
  step,
  disabled,
  error,
  required
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input
        id={id}
        type="number"
        step={step}
        min={min}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? undefined : parseFloat(val));
        }}
        disabled={disabled}
        className={cn(
          "transition-smooth [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
          error && "border-destructive"
        )}
        aria-required={required}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};
