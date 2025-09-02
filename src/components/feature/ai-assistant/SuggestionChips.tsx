import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSuggestionClick: (_suggestion: string) => void;
}

export function SuggestionChips({ suggestions, onSuggestionClick }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2" role="group" aria-label="AI suggested actions" style={{
      // Performance: Optimize suggestion container
      contain: 'layout style'
    }}>
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Lightbulb className="h-3 w-3" aria-hidden="true" />
        <span>Suggested actions:</span>
      </div>
      <div className="flex flex-wrap gap-2" role="list">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
            className="ai-suggestion-chip text-xs h-8 px-3 transition-smooth hover:scale-105"
            role="listitem"
            tabIndex={0}
            aria-label={`Suggestion: ${suggestion}`}
            style={{
              // Performance: Optimize suggestion buttons
              willChange: 'background-color, color, transform',
              contain: 'layout style'
            }}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}