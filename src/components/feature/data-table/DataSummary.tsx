import { useMemo } from 'react';
import { useDemands } from '@/hooks/useApiHooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Package, Calendar, BarChart3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

export function DataSummary() {
  const { data: demandsData, isLoading } = useDemands({ limit: 1000 });

  const summary = useMemo(() => {
    if (!demandsData?.data || demandsData.data.length === 0) {
      return {
        totalRecords: 0,
        totalRevenue: 0,
        totalQuantity: 0,
        uniqueProducts: 0,
        dateRange: { start: null, end: null },
        topProduct: null,
        averagePrice: 0,
        recentTrend: 'neutral'
      };
    }

    const records = demandsData.data;
    const totalRecords = records.length;
    const totalRevenue = records.reduce((sum, record) => sum + (record.quantity * record.price), 0);
    const totalQuantity = records.reduce((sum, record) => sum + record.quantity, 0);

    // Unique products
    const uniqueProducts = new Set(records.map(r => r.productId)).size;

    // Date range
    const dates = records.map(r => parseISO(r.date)).sort((a, b) => a.getTime() - b.getTime());
    const dateRange = {
      start: dates[0] ? format(dates[0], 'dd/MM/yyyy') : null,
      end: dates[dates.length - 1] ? format(dates[dates.length - 1], 'dd/MM/yyyy') : null
    };

    // Top product by revenue
    const productRevenue = records.reduce((acc, record) => {
      const revenue = record.quantity * record.price;
      acc[record.productId] = (acc[record.productId] || 0) + revenue;
      return acc;
    }, {} as Record<string, number>);

    const topProductId = Object.entries(productRevenue).sort(([,a], [,b]) => b - a)[0]?.[0];
    const topProduct = topProductId ? records.find(r => r.productId === topProductId) : null;

    // Average price
    const averagePrice = totalRevenue / totalQuantity;

    // Recent trend (last 7 days vs previous 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentRecords = records.filter(r => parseISO(r.date) >= sevenDaysAgo);
    const previousRecords = records.filter(r =>
      parseISO(r.date) >= fourteenDaysAgo && parseISO(r.date) < sevenDaysAgo
    );

    const recentRevenue = recentRecords.reduce((sum, r) => sum + (r.quantity * r.price), 0);
    const previousRevenue = previousRecords.reduce((sum, r) => sum + (r.quantity * r.price), 0);

    let recentTrend: 'up' | 'down' | 'neutral' = 'neutral';
    if (previousRevenue > 0) {
      const change = ((recentRevenue - previousRevenue) / previousRevenue) * 100;
      if (change > 5) recentTrend = 'up';
      else if (change < -5) recentTrend = 'down';
    }

    return {
      totalRecords,
      totalRevenue,
      totalQuantity,
      uniqueProducts,
      dateRange,
      topProduct,
      averagePrice,
      recentTrend
    };
  }, [demandsData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Data Overview</h2>
        <Badge variant="outline" className="flex items-center space-x-1">
          <BarChart3 className="h-3 w-3" />
          <span>{summary.totalRecords} Records</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {summary.totalRecords} sales records
            </p>
          </CardContent>
        </Card>

        {/* Total Quantity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalQuantity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {summary.uniqueProducts} products
            </p>
          </CardContent>
        </Card>

        {/* Average Price */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.averagePrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per unit average
            </p>
          </CardContent>
        </Card>

        {/* Recent Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Trend</CardTitle>
            {summary.recentTrend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : summary.recentTrend === 'down' ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : (
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{summary.recentTrend}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days vs previous
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Data Period</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {summary.dateRange.start && summary.dateRange.end
                ? `${summary.dateRange.start} - ${summary.dateRange.end}`
                : 'No data available'
              }
            </p>
          </CardContent>
        </Card>

        {/* Top Product */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Top Product</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {summary.topProduct
                ? `${summary.topProduct.productName} (${summary.topProduct.productId})`
                : 'No data available'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
