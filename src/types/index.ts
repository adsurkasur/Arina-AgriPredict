// Re-export all types
export * from './api';

// Additional UI state types
export interface DataTableState {
  loading: boolean;
  error: string | null;
  selectedRowIds: string[];
  sortConfig: {
    key: string;
    direction: 'asc' | 'desc';
  } | null;
}

export interface FormFieldState {
  value: unknown;
  error: string | null;
  touched: boolean;
  loading: boolean;
}

export interface ChartConfig {
  showForecast: boolean;
  forecastDays: number;
  selectedProductId: string | null;
}

export interface UIState {
  sidebarCollapsed: boolean;
  activePanel: 'data' | 'forecast' | 'ai';
  theme: 'light' | 'dark';
}