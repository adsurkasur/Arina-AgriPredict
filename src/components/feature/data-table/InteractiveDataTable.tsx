import { useLocalStorage } from '@/hooks/useLocalStorage';
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
  const [queryParams, setQueryParams] = useLocalStorage<DemandQueryParams>('data-table-params', {
    page: 1,
    limit: 10,
    search: '',
    sortKey: 'date',
    sortOrder: 'asc',
  });
  const debouncedParams = useDebounce(queryParams, 300);
  const { data, isLoading, error } = useDemands(debouncedParams);

  function handleParamsChange(params: Partial<DemandQueryParams>) {
    setQueryParams((prev) => ({ ...prev, ...params }));
  }

  function handleSortChange(key: string, direction: 'asc' | 'desc') {
    setQueryParams((prev) => ({ ...prev, sortKey: key, sortOrder: direction }));
  }

  function handlePageChange(page: number) {
    setQueryParams((prev) => ({ ...prev, page }));
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
        <TableToolbar
          searchValue={queryParams.search || ''}
          onSearchChange={(search) => handleParamsChange({ search, page: 1 })}
          totalItems={data?.pagination?.totalItems || 0}
        />
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 space-y-4 overflow-auto">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-0">
            <LoadingSpinner size="lg" text="Loading sales data..." />
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-auto max-h-[40vh]">
              <DataTableView
                data={data?.data || []}
                sortConfig={{
                  key: queryParams.sortKey || '',
                  direction: queryParams.sortOrder || 'asc'
                }}
                onSort={(key) => handleSortChange(key, queryParams.sortOrder || 'asc')}
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
