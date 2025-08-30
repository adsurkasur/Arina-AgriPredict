import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export function SuggestionChips({ suggestions, onSuggestionClick }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Lightbulb className="h-3 w-3" />
        <span>Suggested actions:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
            className="ai-suggestion-chip text-xs h-8 px-3 transition-smooth hover:scale-105"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}