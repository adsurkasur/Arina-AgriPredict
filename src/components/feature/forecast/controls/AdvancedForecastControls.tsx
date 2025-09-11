import React from 'react';
import { Settings, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProductSelector } from './ProductSelector';
import { DateRangeSelector } from './DateRangeSelector';
import { ForecastParameters } from './ForecastParameters';
import { ModelSelector } from './ModelSelector';
import { AdvancedForecastControlsProps } from './types';
import { useForecastControlsState, useForecastGeneration, useProductSelection } from './hooks';

export const AdvancedForecastControls: React.FC<AdvancedForecastControlsProps> = ({
  onForecastGenerated,
  onProductChange,
  onForecastStart
}) => {
  const {
    selectedProductIds,
    forecastDays,
    sellingPrice,
    dateFrom,
    dateTo,
    selectedModels,
    includeConfidence,
    scenario,
    setSelectedProductIds,
    setForecastDays,
    setSellingPrice,
    setDateFrom,
    setDateTo,
    setSelectedModels,
    setIncludeConfidence,
    setScenario
  } = useForecastControlsState();

  const { products, handleProductChange: handleProductSelectionChange } = useProductSelection(
    selectedProductIds,
    onProductChange
  );

  const { generateForecast, isGenerating } = useForecastGeneration(
    selectedProductIds,
    forecastDays,
    sellingPrice,
    dateFrom,
    dateTo,
    selectedModels,
    includeConfidence,
    scenario,
    onForecastGenerated,
    onForecastStart
  );

  const handleProductChange = (productIds: string[]) => {
    setSelectedProductIds(productIds);
    handleProductSelectionChange(productIds);
  };

  const isDisabled = selectedProductIds.length === 0 || isGenerating;

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
        <ProductSelector
          selectedProductIds={selectedProductIds}
          onProductChange={handleProductChange}
          products={products}
          disabled={false}
        />

        <Separator />

        {/* Date Range */}
        <DateRangeSelector
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          disabled={false}
        />

        <Separator />

        {/* Forecast Parameters */}
        <ForecastParameters
          forecastDays={forecastDays}
          sellingPrice={sellingPrice}
          scenario={scenario}
          includeConfidence={includeConfidence}
          onDaysChange={setForecastDays}
          onPriceChange={setSellingPrice}
          onScenarioChange={setScenario}
          onConfidenceChange={setIncludeConfidence}
          disabled={false}
        />

        <Separator />

        {/* Model Selection */}
        <ModelSelector
          selectedModels={selectedModels}
          onModelChange={setSelectedModels}
          disabled={false}
        />

        <Separator />

        {/* Generate Button */}
        <div className="flex justify-end">
          <Button
            onClick={generateForecast}
            disabled={isDisabled}
            className="min-w-[140px]"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Generating...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Generate Forecast
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
