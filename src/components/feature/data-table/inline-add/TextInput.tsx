import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { TextInputProps } from './types';

export const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  required
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "transition-smooth",
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
