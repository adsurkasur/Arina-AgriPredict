import React from 'react';
import { Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ProductInputProps, AISuggestionsProps } from './types';

const AISuggestions: React.FC<AISuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  disabled
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-2 p-2 bg-primary/5 rounded-md border border-primary/20">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="h-3 w-3 text-primary" />
        <span className="text-xs font-medium text-primary">AI Suggestions</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSuggestionClick(suggestion)}
            className="px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded border border-primary/20 transition-colors"
            disabled={disabled}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export const ProductInput: React.FC<ProductInputProps> = ({
  value,
  onChange,
  suggestions,
  showSuggestions,
  onSuggestionClick,
  disabled,
  error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="productName" className="text-xs">Product Name</Label>
      <Input
        id="productName"
        type="text"
        placeholder="Enter product name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "transition-smooth",
          error && "border-destructive"
        )}
        aria-required="true"
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {showSuggestions && (
        <AISuggestions
          suggestions={suggestions}
          onSuggestionClick={onSuggestionClick}
          disabled={disabled}
        />
      )}
    </div>
  );
};
