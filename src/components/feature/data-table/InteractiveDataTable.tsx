import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDemands } from '@/hooks/useApiHooks';
import { useDebounce } from '@/hooks/useDebounce';
import { DemandQueryParams, DemandRecord } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableToolbar } from './toolbar';
import { DataTableView } from './DataTableView';
import { TablePagination } from './TablePagination';
import { InlineAddRow } from './inline-add';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Database } from 'lucide-react';
import { useMemo, useState } from 'react';

export function InteractiveDataTable() {
  const [queryParams, setQueryParams] = useLocalStorage<DemandQueryParams>('data-table-params', {
    page: 1,
    limit: 10,
    search: '',
    sortKey: 'date',
    sortOrder: 'asc',
    dateFrom: undefined,
    dateTo: undefined,
    priceMin: undefined,
    priceMax: undefined,
    quantityMin: undefined,
    quantityMax: undefined,
    productIds: undefined,
  });

  // Separate search from other filters for client-side filtering
  const [localSearch, setLocalSearch] = useState(queryParams.search || '');

  // Debounce only non-search parameters for API calls
  const filterParams = useMemo(() => ({
    page: queryParams.page,
    limit: queryParams.limit,
    sortKey: queryParams.sortKey,
    sortOrder: queryParams.sortOrder,
    dateFrom: queryParams.dateFrom,
    dateTo: queryParams.dateTo,
    priceMin: queryParams.priceMin,
    priceMax: queryParams.priceMax,
    quantityMin: queryParams.quantityMin,
    quantityMax: queryParams.quantityMax,
    productIds: queryParams.productIds,
    // Remove search from API call - handled client-side
  }), [
    queryParams.page,
    queryParams.limit,
    queryParams.sortKey,
    queryParams.sortOrder,
    queryParams.dateFrom,
    queryParams.dateTo,
    queryParams.priceMin,
    queryParams.priceMax,
    queryParams.quantityMin,
    queryParams.quantityMax,
    queryParams.productIds,
  ]);

  const debouncedFilterParams = useDebounce(filterParams, 300);
  const { data: apiData, isLoading, error } = useDemands(debouncedFilterParams);

  // Client-side search filtering
  const filteredData = useMemo(() => {
    if (!apiData?.data) return apiData;

    if (!localSearch.trim()) {
      return apiData;
    }

    const searchTerm = localSearch.toLowerCase();
    const filtered = apiData.data.filter((record: DemandRecord) => {
      // Search in multiple fields
      const searchableText = [
        record.productName,
        record.productId,
        record.date,
        record.quantity.toString(),
        record.price.toString(),
        `$${record.price.toFixed(2)}`, // formatted price
        new Date(record.date).toLocaleDateString('en-GB'), // formatted date dd/mm/yyyy
      ].join(' ').toLowerCase();

      return searchableText.includes(searchTerm);
    });

    return {
      data: filtered,
      pagination: {
        ...apiData.pagination,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / (filterParams.limit || 10)),
      },
    };
  }, [apiData, localSearch, filterParams.limit]);

  function handleParamsChange(params: Partial<DemandQueryParams>) {
    setQueryParams((prev) => ({ ...prev, ...params }));
  }

  function handleSearchChange(search: string) {
    setLocalSearch(search);
    // Update persisted params for search
    setQueryParams((prev) => ({ ...prev, search }));
  }

  function handleSortChange(key: string, direction: 'asc' | 'desc') {
    setQueryParams((prev) => ({ ...prev, sortKey: key, sortOrder: direction }));
  }

  function handlePageChange(page: number) {
    setQueryParams((prev) => ({ ...prev, page }));
  }

  function handlePageSizeChange(pageSize: number) {
    setQueryParams((prev) => ({ ...prev, limit: pageSize, page: 1 }));
  }

  if (error) {
    return (
      <ErrorDisplay message={error.message || 'Unknown error'} />
    );
  }

  return (
    <Card className="flex flex-col h-full min-h-0 overflow-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-primary" />
          <span>Sales Data Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 space-y-3 overflow-visible">
        <TableToolbar
          searchValue={localSearch}
          onSearchChange={handleSearchChange}
          totalItems={filteredData?.pagination?.totalItems || 0}
          data={filteredData?.data || []}
          filters={{
            dateFrom: queryParams.dateFrom,
            dateTo: queryParams.dateTo,
            priceMin: queryParams.priceMin,
            priceMax: queryParams.priceMax,
            quantityMin: queryParams.quantityMin,
            quantityMax: queryParams.quantityMax,
            productIds: queryParams.productIds,
          }}
          onFiltersChange={(filters) => handleParamsChange({ ...filters, page: 1 })}
        />

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-0">
            <LoadingSpinner size="lg" text="Loading sales data..." />
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-auto max-h-[40vh]">
              <DataTableView
                data={filteredData?.data || []}
                sortConfig={{
                  key: queryParams.sortKey || '',
                  direction: queryParams.sortOrder || 'asc'
                }}
                onSort={(key) => handleSortChange(key, queryParams.sortOrder || 'asc')}
              />
            </div>

            <InlineAddRow />

            {filteredData?.pagination && (
              <TablePagination
                currentPage={filteredData.pagination.currentPage}
                totalPages={filteredData.pagination.totalPages}
                totalItems={filteredData.pagination.totalItems}
                pageSize={queryParams.limit || 10}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
