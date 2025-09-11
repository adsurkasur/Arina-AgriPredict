"use client";
import React from 'react';
import { CalendarIcon, Settings, TrendingUp } from 'lucide-react';
import { useForecast, useProducts } from '@/hooks/useApiHooks';
import { useAppStore } from '@/store/zustand-store';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ForecastResponse, ForecastRequest } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AdvancedForecastControlsProps {
  onForecastGenerated: (_forecast: ForecastResponse) => void;
  onProductChange?: (_productIds: string[]) => void;
  onForecastStart?: () => void;
}

export function AdvancedForecastControls({
  onForecastGenerated,
  onProductChange,
  onForecastStart
}: AdvancedForecastControlsProps) {
  // Enhanced state management
  const [selectedProductIds, setSelectedProductIds] = useLocalStorage<string[]>('forecast-selected-products', []);
  const [forecastDays, setForecastDays] = useLocalStorage<number>('forecast-days', 14);
  const [sellingPrice, setSellingPrice] = useLocalStorage<number>('forecast-selling-price', 0);
  const [dateFrom, setDateFrom] = useLocalStorage<Date | undefined>('forecast-date-from', undefined);
  const [dateTo, setDateTo] = useLocalStorage<Date | undefined>('forecast-date-to', undefined);
  const [selectedModels, setSelectedModels] = useLocalStorage<string[]>('forecast-models', ['ensemble']);
  const [includeConfidence, setIncludeConfidence] = useLocalStorage<boolean>('forecast-confidence', true);
  const [scenario, setScenario] = useLocalStorage<'optimistic' | 'pessimistic' | 'realistic'>('forecast-scenario', 'realistic');
  const [productSelectOpen, setProductSelectOpen] = React.useState(false);

  const { data: products = [] } = useProducts();
  const forecastMutation = useForecast();
  const { setForecasting } = useAppStore();

  const availableModels = [
    { id: 'ensemble', name: 'Ensemble (Recommended)', description: 'Combines multiple models' },
    { id: 'sma', name: 'Simple Moving Average', description: 'Basic trend analysis' },
    { id: 'wma', name: 'Weighted Moving Average', description: 'Recent data weighted more' },
    { id: 'es', name: 'Exponential Smoothing', description: 'Seasonal trend analysis' },
    { id: 'arima', name: 'ARIMA', description: 'Statistical time series' },
    { id: 'catboost', name: 'CatBoost', description: 'Machine learning model' }
  ];

  const scenarios = [
    { id: 'optimistic', name: 'Optimistic', description: 'Best case scenario' },
    { id: 'realistic', name: 'Realistic', description: 'Balanced scenario' },
    { id: 'pessimistic', name: 'Pessimistic', description: 'Worst case scenario' }
  ];

  const handleProductToggle = (productId: string) => {
    const newSelection = selectedProductIds.includes(productId)
      ? selectedProductIds.filter(id => id !== productId)
      : [...selectedProductIds, productId];

    setSelectedProductIds(newSelection);
    onProductChange?.(newSelection);
  };

  const handleModelToggle = (modelId: string) => {
    if (modelId === 'ensemble') {
      setSelectedModels(['ensemble']);
    } else {
      const newModels = selectedModels.includes(modelId)
        ? selectedModels.filter(id => id !== modelId)
        : [...selectedModels.filter(m => m !== 'ensemble'), modelId];

      if (newModels.length === 0) {
        setSelectedModels(['ensemble']);
      } else {
        setSelectedModels(newModels);
      }
    }
  };

  const handleGenerateForecast = () => {
    if (selectedProductIds.length === 0) return;

    onForecastStart?.();
    setForecasting(true);

    // Generate forecast for each selected product
    const forecastPromises = selectedProductIds.map(productId => {
      const request: ForecastRequest = {
        productId,
        days: forecastDays,
        sellingPrice: sellingPrice > 0 ? sellingPrice : undefined,
        dateFrom: dateFrom?.toISOString(),
        dateTo: dateTo?.toISOString(),
        models: selectedModels,
        includeConfidence,
        scenario
      };

      return forecastMutation.mutateAsync(request);
    });

    // Handle multiple forecasts
    Promise.all(forecastPromises)
      .then((results) => {
        // For now, use the first result - later we can enhance to handle multiple
        if (results[0]) {
          onForecastGenerated(results[0]);
        }
        setForecasting(false);
      })
      .catch(() => {
        setForecasting(false);
      });
  };

  const isDisabled = selectedProductIds.length === 0 || forecastMutation.isPending;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-primary" />
          <span>Advanced Forecast Controls</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Products</Label>
          <Popover open={productSelectOpen} onOpenChange={setProductSelectOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={productSelectOpen}
                className="w-full justify-between"
                disabled={forecastMutation.isPending}
              >
                {selectedProductIds.length === 0
                  ? "Select products..."
                  : `${selectedProductIds.length} product${selectedProductIds.length === 1 ? '' : 's'} selected`
                }
                <Settings className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search products..." />
                <CommandEmpty>No products found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {products.map((product) => (
                    <CommandItem
                      key={product.id}
                      onSelect={() => {
                        handleProductToggle(product.id);
                        setProductSelectOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedProductIds.includes(product.id)}
                        className="mr-2"
                        onChange={() => {}} // Handled by onSelect
                      />
                      <span className="flex-1">{product.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedProductIds.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedProductIds.map(id => {
                const product = products.find(p => p.id === id);
                return product ? (
                  <Badge key={id} variant="secondary" className="text-xs">
                    {product.name}
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                  disabled={forecastMutation.isPending}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "Pick start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                  disabled={forecastMutation.isPending}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "Pick end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Forecast Horizon */}
        <div className="space-y-2">
          <Label htmlFor="forecast-days" className="text-sm font-medium">
            Forecast Horizon (Days)
          </Label>
          <Select
            value={forecastDays.toString()}
            onValueChange={(value) => setForecastDays(parseInt(value))}
            disabled={forecastMutation.isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selling Price */}
        <div className="space-y-2">
          <Label htmlFor="selling-price" className="text-sm font-medium">
            Selling Price ($ per unit)
          </Label>
          <Input
            id="selling-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
            disabled={forecastMutation.isPending}
          />
        </div>

        <Separator />

        {/* Model Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Forecasting Models</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableModels.map((model) => (
              <div key={model.id} className="flex items-start space-x-2">
                <Checkbox
                  id={`model-${model.id}`}
                  checked={selectedModels.includes(model.id)}
                  onCheckedChange={() => handleModelToggle(model.id)}
                  disabled={forecastMutation.isPending}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={`model-${model.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {model.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {model.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Scenario</Label>
          <Select
            value={scenario}
            onValueChange={(value: 'optimistic' | 'pessimistic' | 'realistic') => setScenario(value)}
            disabled={forecastMutation.isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Confidence Intervals */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="confidence"
            checked={includeConfidence}
            onCheckedChange={(checked) => setIncludeConfidence(checked === true)}
            disabled={forecastMutation.isPending}
          />
          <Label htmlFor="confidence" className="text-sm cursor-pointer">
            Include confidence intervals
          </Label>
        </div>

        <Separator />

        {/* Generate Button */}
        <Button
          onClick={handleGenerateForecast}
          disabled={isDisabled}
          className="w-full transition-all duration-300"
          size="lg"
        >
          {forecastMutation.isPending ? (
            <LoadingSpinner size="sm" text="Generating..." />
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              Generate Advanced Forecast
            </>
          )}
        </Button>

        {/* Selected Configuration Summary */}
        {(selectedProductIds.length > 0 || selectedModels.length > 0) && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Configuration Summary</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Products: {selectedProductIds.length}</div>
              <div>Models: {selectedModels.join(', ')}</div>
              <div>Scenario: {scenario}</div>
              <div>Confidence: {includeConfidence ? 'Enabled' : 'Disabled'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
