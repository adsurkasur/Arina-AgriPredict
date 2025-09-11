import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FilterPanelProps, DateRangeFilterProps, NumberRangeFilterProps } from './types';

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">Date Range</Label>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label className="text-xs text-muted-foreground">From</Label>
        <Input
          type="date"
          value={dateFrom || ''}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="h-8"
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">To</Label>
        <Input
          type="date"
          value={dateTo || ''}
          onChange={(e) => onDateToChange(e.target.value)}
          className="h-8"
        />
      </div>
    </div>
  </div>
);

const NumberRangeFilter: React.FC<NumberRangeFilterProps> = ({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
  step = 1,
  minValue = 0
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{label}</Label>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label className="text-xs text-muted-foreground">Min</Label>
        <Input
          type="number"
          step={step}
          min={minValue}
          placeholder="0"
          value={min || ''}
          onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : undefined)}
          className="h-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Max</Label>
        <Input
          type="number"
          step={step}
          min={minValue}
          placeholder=""
          value={max || ''}
          onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : undefined)}
          className="h-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
        />
      </div>
    </div>
  </div>
);

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onOpenChange
}) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleApplyFilters = () => {
    // Keep popup open after applying filters
  };

  const handleClearFilters = () => {
    onFiltersChange({});
    // Keep popup open after clearing filters
  };

  const getActiveFilterCount = () => {
    const filterFields = [
      filters.dateFrom,
      filters.dateTo,
      filters.priceMin,
      filters.priceMax,
      filters.quantityMin,
      filters.quantityMax,
      filters.productIds
    ];

    return filterFields.filter(isFilterActive).length;
  };

  const isFilterActive = (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null;
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="transition-smooth" aria-label="Open filters">
          <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs font-medium min-w-[18px] h-5 flex items-center justify-center">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filters</h4>
            <PopoverPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </PopoverPrimitive.Close>
          </div>

          <div className="space-y-3">
            <DateRangeFilter
              dateFrom={filters.dateFrom}
              dateTo={filters.dateTo}
              onDateFromChange={(value) => updateFilter('dateFrom', value)}
              onDateToChange={(value) => updateFilter('dateTo', value)}
            />

            <NumberRangeFilter
              label="Price Range ($)"
              min={filters.priceMin}
              max={filters.priceMax}
              onMinChange={(value) => updateFilter('priceMin', value)}
              onMaxChange={(value) => updateFilter('priceMax', value)}
            />

            <NumberRangeFilter
              label="Quantity Range"
              min={filters.quantityMin}
              max={filters.quantityMax}
              onMinChange={(value) => updateFilter('quantityMin', value)}
              onMaxChange={(value) => updateFilter('quantityMax', value)}
              step={1}
              minValue={0}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button size="sm" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
