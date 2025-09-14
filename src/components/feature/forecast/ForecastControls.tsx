import React from 'react';
import { TrendingUp, Target } from 'lucide-react';
import { useForecast } from '@/hooks/useApiHooks';
import { useProducts } from '@/hooks/useApiHooks';
import { useAppStore } from '@/store/zustand-store';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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
  onForecastGenerated: (_forecast: ForecastResponse) => void;
  onProductChange?: (_productId: string | null) => void;
  onForecastStart?: () => void;
}

export function ForecastControls({ onForecastGenerated, onProductChange, onForecastStart }: ForecastControlsProps) {
  const [selectedProductId, setSelectedProductId] = useLocalStorage<string | null>('forecast-selected-product', null);
  const [forecastDays] = useLocalStorage<number>('forecast-days', 14);
  const [sellingPrice, setSellingPrice] = useLocalStorage<number>('forecast-selling-price', 0);
  const { data: products = [] } = useProducts();
  const forecastMutation = useForecast();
  const { setForecasting, setForecastConfig } = useAppStore();

  const handleProductChange = (productId: string | null) => {
    setSelectedProductId(productId);
    onProductChange?.(productId);
  };

  const handleGenerateForecast = () => {
    if (!selectedProductId) return;
    onForecastStart?.();
    setForecasting(true);
    setForecastConfig({ 
      selectedProductId, 
      forecastDays, 
      showForecast: true 
    });
    forecastMutation.mutate(
      { 
        productId: selectedProductId, 
        days: forecastDays,
        sellingPrice: sellingPrice > 0 ? sellingPrice : undefined
      },
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
    <Card aria-label="Forecast Controls">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
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
            value={selectedProductId ?? undefined} 
            onValueChange={handleProductChange}
            disabled={forecastMutation.isPending}
            aria-label="Select product to forecast"
          >
            <SelectTrigger id="product-select">
              <div className="flex items-center">
                <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                <SelectValue placeholder="Choose a product to forecast" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id} aria-label={product.name}>
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

        {/* Selling Price */}
        <div className="space-y-2">
          <Label htmlFor="selling-price" className="text-sm font-medium">
            Selling Price (Rp per {selectedProduct?.unit || 'unit'})
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
            aria-label="Selling price for revenue projection"
          />
          <p className="text-xs text-muted-foreground">
            Used to calculate projected revenue from forecasted demand
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateForecast}
          disabled={isDisabled}
          className="w-full transition-all duration-300"
          size="lg"
          aria-label="Generate forecast"
        >
          {forecastMutation.isPending ? (
            <LoadingSpinner size="sm" text="Generating..." />
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" aria-hidden="true" />
              Generate Forecast
            </>
          )}
        </Button>

        {/* Selected Product Info */}
        {selectedProduct && (
          <div className="p-3 bg-muted rounded-lg" aria-label="Selected product info">
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