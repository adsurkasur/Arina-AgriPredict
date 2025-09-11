import { ForecastResponse } from '@/types/api';

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
}

export interface AdvancedForecastControlsProps {
  onForecastGenerated: (_forecast: ForecastResponse) => void;
  onProductChange?: (_productIds: string[]) => void;
  onForecastStart?: () => void;
}

export interface ProductSelectorProps {
  selectedProductIds: string[];
  onProductChange: (_productIds: string[]) => void;
  products: Product[];
  disabled?: boolean;
}

export interface DateRangeSelectorProps {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateFromChange: (_date: Date | undefined) => void;
  onDateToChange: (_date: Date | undefined) => void;
  disabled?: boolean;
}

export interface ModelSelectorProps {
  selectedModels: string[];
  onModelChange: (_models: string[]) => void;
  disabled?: boolean;
}

export interface ForecastParametersProps {
  forecastDays: number;
  sellingPrice: number;
  scenario: 'optimistic' | 'pessimistic' | 'realistic';
  includeConfidence: boolean;
  onDaysChange: (_days: number) => void;
  onPriceChange: (_price: number) => void;
  onScenarioChange: (_scenario: 'optimistic' | 'pessimistic' | 'realistic') => void;
  onConfidenceChange: (_include: boolean) => void;
  disabled?: boolean;
}

export interface ForecastModel {
  id: string;
  name: string;
  description: string;
}

export interface Scenario {
  id: 'optimistic' | 'pessimistic' | 'realistic';
  name: string;
  description: string;
}

export interface ForecastControlsState {
  selectedProductIds: string[];
  forecastDays: number;
  sellingPrice: number;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  selectedModels: string[];
  includeConfidence: boolean;
  scenario: 'optimistic' | 'pessimistic' | 'realistic';
}
