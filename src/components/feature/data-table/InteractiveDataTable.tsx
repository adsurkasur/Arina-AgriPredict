import { useState } from 'react';
import { useDemands } from '@/hooks/useApiHooks';
import { useDebounce } from '@/hooks/useDebounce';
import { DemandQueryParams } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableToolbar } from './TableToolbar';
import { DataTableView } from './DataTableView';
import { TablePagination } from './TablePagination';
import { InlineAddRow } from './InlineAddRow';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Database } from 'lucide-react';

export function InteractiveDataTable() {
  const [queryParams, setQueryParams] = useState<DemandQueryParams>({
    page: 1,
    limit: 10,
    search: '',
    sortKey: 'date',
    sortOrder: 'desc',
  });

  const debouncedSearch = useDebounce(queryParams.search || '', 300);
  const debouncedParams = { ...queryParams, search: debouncedSearch };

  const { data, isLoading, error, refetch } = useDemands(debouncedParams);

  const handleParamsChange = (updates: Partial<DemandQueryParams>) => {
    setQueryParams(prev => ({ ...prev, ...updates }));
  };

  const handlePageChange = (page: number) => {
    handleParamsChange({ page });
  };

  const handleSortChange = (sortKey: string) => {
    const sortOrder = queryParams.sortKey === sortKey && queryParams.sortOrder === 'asc' 
      ? 'desc' 
      : 'asc';
    handleParamsChange({ sortKey, sortOrder });
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Sales Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorDisplay
            title="Failed to load sales data"
            message={error.message || 'An error occurred while fetching data'}
            onRetry={() => refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-primary" />
          <span>Sales Data Management</span>
        </CardTitle>
        <TableToolbar
          searchValue={queryParams.search || ''}
          onSearchChange={(search) => handleParamsChange({ search, page: 1 })}
          totalItems={data?.pagination.totalItems || 0}
        />
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" text="Loading sales data..." />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              <DataTableView
                data={data?.data || []}
                sortConfig={{
                  key: queryParams.sortKey || '',
                  direction: queryParams.sortOrder || 'asc'
                }}
                onSort={handleSortChange}
              />
            </div>

            <InlineAddRow />

            {data?.pagination && (
              <TablePagination
                currentPage={data.pagination.currentPage}
                totalPages={data.pagination.totalPages}
                totalItems={data.pagination.totalItems}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}