import React from 'react';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { DataActions } from './DataActions';
import { TableToolbarProps } from './types';
import { useFilters } from './hooks';

export const TableToolbar: React.FC<TableToolbarProps> = ({
  searchValue,
  onSearchChange,
  totalItems,
  data = [],
  filters = {},
  onFiltersChange
}) => {
  const {
    filters: localFilters,
    isOpen: filterOpen,
    setIsOpen: setFilterOpen
  } = useFilters(filters);

  return (
    <div className="flex items-center justify-between space-x-4" role="toolbar" aria-label="Table controls">
      <div className="flex items-center space-x-4 flex-1">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
        />

        <FilterPanel
          filters={localFilters}
          onFiltersChange={(newFilters) => {
            if (onFiltersChange) {
              onFiltersChange(newFilters);
            }
          }}
          isOpen={filterOpen}
          onOpenChange={setFilterOpen}
        />
      </div>

      <DataActions
        data={data}
        isImporting={false}
        totalItems={totalItems}
      />
    </div>
  );
};
