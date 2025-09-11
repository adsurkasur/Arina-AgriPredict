export interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (_value: string) => void;
  totalItems: number;
  data?: any[];
  filters?: TableFilters;
  onFiltersChange?: (_filters: TableFilters) => void;
}

export interface TableFilters {
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  quantityMin?: number;
  quantityMax?: number;
  productIds?: string[];
}

export interface SearchBarProps {
  value: string;
  onChange: (_value: string) => void;
  placeholder?: string;
}

export interface FilterPanelProps {
  filters: TableFilters;
  onFiltersChange: (_filters: TableFilters) => void;
  isOpen: boolean;
  onOpenChange: (_open: boolean) => void;
}

export interface DataActionsProps {
  data: any[];
  isImporting: boolean;
  totalItems: number;
}

export interface ImportResult {
  successCount: number;
  errorCount: number;
}

export interface BulkImportResult {
  processed: number;
  totalRows: number;
}

export interface CsvValidationResult {
  isValid: boolean;
  error?: string;
}

export interface CsvRowData {
  date: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface ImportStrategy {
  type: 'bulk' | 'regular';
  reason: string;
}

export interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
}

export interface DateRangeFilterProps {
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange: (_value: string) => void;
  onDateToChange: (_value: string) => void;
}

export interface NumberRangeFilterProps {
  label: string;
  min?: number;
  max?: number;
  onMinChange: (_value?: number) => void;
  onMaxChange: (_value?: number) => void;
  step?: number;
  minValue?: number;
}
