import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ 
  title = "Something went wrong", 
  message, 
  onRetry,
  className = ""
}: ErrorDisplayProps) {
  return (
    <Alert variant="destructive" className={`transition-smooth ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-semibold">{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm text-white/90">{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-3 h-8 text-xs"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}