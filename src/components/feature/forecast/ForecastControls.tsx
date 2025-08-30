import { useState } from 'react';
import { TrendingUp, Calendar, Target } from 'lucide-react';
import { useForecast } from '@/hooks/useApiHooks';
import { useProducts } from '@/hooks/useApiHooks';
import { useAppStore } from '@/store/zustand-store';
import { ForecastResponse } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ForecastControlsProps {
  onForecastGenerated: (forecast: ForecastResponse) => void;
}

export function ForecastControls({ onForecastGenerated }: ForecastControlsProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [forecastDays, setForecastDays] = useState<number>(14);
  
  const { data: products = [] } = useProducts();
  const forecastMutation = useForecast();
  const { setForecasting, setForecastConfig } = useAppStore();

  const handleGenerateForecast = () => {
    if (!selectedProductId) return;

    setForecasting(true);
    setForecastConfig({ 
      selectedProductId, 
      forecastDays, 
      showForecast: true 
    });

    forecastMutation.mutate(
      { productId: selectedProductId, days: forecastDays },
      {
        onSuccess: (data) => {
          onForecastGenerated(data);
          setForecasting(false);
        },
        onError: () => {
          setForecasting(false);
        },
      }
    );
  };

  const isDisabled = !selectedProductId || forecastMutation.isPending;
  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          <span>Generate Forecast</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Selection */}
        <div className="space-y-2">
          <Label htmlFor="product-select" className="text-sm font-medium">
            Select Product
          </Label>
          <Select 
            value={selectedProductId} 
            onValueChange={setSelectedProductId}
            disabled={forecastMutation.isPending}
          >
            <SelectTrigger id="product-select">
              <div className="flex items-center">
                <Target className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Choose a product to forecast" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({product.category})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Forecast Days */}
        <div className="space-y-2">
          <Label htmlFor="forecast-days" className="text-sm font-medium">
            Forecast Period (Days)
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="forecast-days"
              type="number"
              min="1"
              max="365"
              value={forecastDays}
              onChange={(e) => setForecastDays(parseInt(e.target.value) || 14)}
              className="pl-10"
              disabled={forecastMutation.isPending}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Generate forecast for the next {forecastDays} days
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateForecast}
          disabled={isDisabled}
          className="w-full transition-smooth"
          size="lg"
        >
          {forecastMutation.isPending ? (
            <LoadingSpinner size="sm" text="Generating..." />
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              Generate Forecast
            </>
          )}
        </Button>

        {/* Selected Product Info */}
        {selectedProduct && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium text-foreground">
              Selected: {selectedProduct.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Category: {selectedProduct.category} • Unit: {selectedProduct.unit}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}