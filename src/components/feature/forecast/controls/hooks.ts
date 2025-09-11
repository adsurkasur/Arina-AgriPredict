import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAppStore } from '@/store/zustand-store';
import { useForecast, useProducts } from '@/hooks/useApiHooks';
import { ForecastResponse } from '@/types/api';
import { ForecastControlsState } from './types';

export const useForecastControlsState = (): ForecastControlsState & {
  setSelectedProductIds: (_ids: string[]) => void;
  setForecastDays: (_days: number) => void;
  setSellingPrice: (_price: number) => void;
  setDateFrom: (_date: Date | undefined) => void;
  setDateTo: (_date: Date | undefined) => void;
  setSelectedModels: (_models: string[]) => void;
  setIncludeConfidence: (_include: boolean) => void;
  setScenario: (_scenario: 'optimistic' | 'pessimistic' | 'realistic') => void;
} => {
  const [selectedProductIds, setSelectedProductIds] = useLocalStorage<string[]>('forecast-selected-products', []);
  const [forecastDays, setForecastDays] = useLocalStorage<number>('forecast-days', 14);
  const [sellingPrice, setSellingPrice] = useLocalStorage<number>('forecast-selling-price', 0);
  const [dateFrom, setDateFrom] = useLocalStorage<Date | undefined>('forecast-date-from', undefined);
  const [dateTo, setDateTo] = useLocalStorage<Date | undefined>('forecast-date-to', undefined);
  const [selectedModels, setSelectedModels] = useLocalStorage<string[]>('forecast-models', ['ensemble']);
  const [includeConfidence, setIncludeConfidence] = useLocalStorage<boolean>('forecast-confidence', true);
  const [scenario, setScenario] = useLocalStorage<'optimistic' | 'pessimistic' | 'realistic'>('forecast-scenario', 'realistic');

  return {
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
  };
};

export const useForecastGeneration = (
  selectedProductIds: string[],
  forecastDays: number,
  sellingPrice: number,
  dateFrom: Date | undefined,
  dateTo: Date | undefined,
  selectedModels: string[],
  includeConfidence: boolean,
  scenario: 'optimistic' | 'pessimistic' | 'realistic',
  onForecastGenerated: (_forecast: ForecastResponse) => void,
  onForecastStart?: () => void
) => {
  const forecastMutation = useForecast();
  const { setForecasting } = useAppStore();

  const generateForecast = () => {
    if (selectedProductIds.length === 0) return;

    onForecastStart?.();
    setForecasting(true);

    // Generate forecast for each selected product
    const forecastPromises = selectedProductIds.map(productId => {
      const request = {
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

  return {
    generateForecast,
    isGenerating: forecastMutation.isPending
  };
};

export const useProductSelection = (
  _selectedProductIds: string[],
  onProductChange?: (_productIds: string[]) => void
) => {
  const { data: products = [] } = useProducts();

  const handleProductChange = (productIds: string[]) => {
    onProductChange?.(productIds);
  };

  return {
    products,
    handleProductChange
  };
};
