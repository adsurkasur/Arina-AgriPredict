import { useState } from 'react';
import { useProcessData } from '@/hooks/useApiHooks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIDataInputProps {
  className?: string;
}

export function AIDataInput({ className }: AIDataInputProps) {
  const [inputText, setInputText] = useState('');
  const processMutation = useProcessData();

  const handleProcess = () => {
    if (!inputText.trim()) return;
    processMutation.mutate(inputText.trim());
  };

  const isProcessing = processMutation.isPending;

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>AI-Powered Data Input</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Describe your sales data in natural language and let AI extract the structured information automatically.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="data-input" className="text-sm font-medium">
            Sales Data Description
          </Label>
          <Textarea
            id="data-input"
            placeholder="Example: Sold 150 kg of red chili on March 15th for $8.50 per kg. Also sold 200 kg of onions yesterday for $3.20 per kg..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isProcessing}
            className="min-h-[120px] resize-none"
            aria-describedby="data-input-help"
          />
          <p id="data-input-help" className="text-xs text-muted-foreground">
            Include dates, products, quantities, and prices in your description.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>AI will automatically extract and structure your data</span>
          </div>

          <Button
            onClick={handleProcess}
            disabled={!inputText.trim() || isProcessing}
            className="min-w-[120px]"
            aria-label="Process data with AI"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Process Data
              </>
            )}
          </Button>
        </div>

        {processMutation.isSuccess && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ Successfully processed {processMutation.data?.processed || 0} records from your input.
            </p>
          </div>
        )}

        {processMutation.isError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">
              ❌ Failed to process data. Please check your input and try again.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
