"use client";
import { useState, useEffect, useMemo } from "react";
import { EnhancedDemandChart } from "@/components/feature/forecast/enhanced-demand-chart";
import { ExportCapabilities } from "@/components/feature/forecast/export";
import { AdvancedAnalytics } from "@/components/feature/forecast/AdvancedAnalytics";
import { ModelComparison } from "@/components/feature/forecast/model-comparison";
import { useDemands, useProducts, useModelComparison, useForecast } from "@/hooks/useApiHooks";
import { ForecastResponse, ComparisonResponse } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { 
  Loader2, BarChart3, TrendingUp, GitCompare, Play, Database, 
  ChartLine, FileDown, Brain, Settings2, CheckCircle2
} from "lucide-react";

export default function ForecastPage() {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [forecastDays, setForecastDays] = useState<number>(14);
  const [activeTab, setActiveTab] = useState<string>("data");

  // Get all demand data and products
  const { data: allDemandsData, isLoading: isLoadingDemands } = useDemands({ limit: 1000 });
  const { data: productsData } = useProducts();
  
  // Model comparison and forecast mutations
  const modelComparison = useModelComparison();
  const forecast = useForecast();

  // Get unique products from demands data - memoized to prevent unnecessary re-renders
  const availableProducts = useMemo(() => productsData || [], [productsData]);
  
  // Filter demands for selected product
  const filteredDemands = useMemo(() => 
    selectedProductId 
      ? allDemandsData?.data?.filter(d => d.productId === selectedProductId) || []
      : allDemandsData?.data || [],
    [selectedProductId, allDemandsData?.data]
  );

  // Auto-select first product if none selected
  useEffect(() => {
    if (!selectedProductId && availableProducts.length > 0) {
      setSelectedProductId(availableProducts[0].id);
    }
  }, [availableProducts, selectedProductId]);

  const handleRunComparison = () => {
    if (!selectedProductId) return;
    
    modelComparison.mutate(
      {
        productId: selectedProductId,
        days: forecastDays,
        includeEnsemble: true,
      },
      {
        onSuccess: (data) => {
          setComparisonData(data);
          setActiveTab("compare");
        },
      }
    );
  };

  const handleGenerateForecast = () => {
    if (!selectedProductId) return;

    forecast.mutate(
      {
        productId: selectedProductId,
        days: forecastDays,
        models: ['sma', 'wma', 'es', 'arima', 'catboost', 'ensemble'],
        includeConfidence: true,
      },
      {
        onSuccess: (data) => {
          setForecastData(data);
          setActiveTab("forecast");
        },
      }
    );
  };

  const selectedProduct = availableProducts.find(p => p.id === selectedProductId);
  const dataPointCount = filteredDemands.length;

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Data Selection */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ChartLine className="h-5 w-5 text-primary" />
                  Demand Forecasting & Model Analytics
                </CardTitle>
                <CardDescription className="mt-1">
                  Analyze historical data, compare forecasting models, and generate predictions
                </CardDescription>
              </div>
              {dataPointCount > 0 && (
                <Badge variant="secondary" className="text-sm">
                  <Database className="h-3 w-3 mr-1" />
                  {dataPointCount} data points
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Forecast Horizon */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Forecast Days</Label>
                <Input
                  type="number"
                  min="7"
                  max="90"
                  value={forecastDays}
                  onChange={(e) => setForecastDays(parseInt(e.target.value) || 14)}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <Button 
                onClick={handleRunComparison} 
                disabled={!selectedProductId || modelComparison.isPending}
                variant="outline"
                className="h-10"
              >
                {modelComparison.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <GitCompare className="h-4 w-4 mr-2" />
                )}
                Compare Models
              </Button>

              <Button 
                onClick={handleGenerateForecast} 
                disabled={!selectedProductId || forecast.isPending}
                className="h-10"
              >
                {forecast.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                Generate Forecast
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="data" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Historical Data</span>
              <span className="sm:hidden">Data</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-1">
              <GitCompare className="h-4 w-4" />
              <span className="hidden sm:inline">Model Comparison</span>
              <span className="sm:hidden">Compare</span>
              {comparisonData && <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Forecast Results</span>
              <span className="sm:hidden">Forecast</span>
              {forecastData && <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-1">
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </TabsTrigger>
          </TabsList>

          {/* Historical Data Tab */}
          <TabsContent value="data" className="space-y-4 mt-4">
            {isLoadingDemands ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : (
              <EnhancedDemandChart
                demandData={filteredDemands}
                forecastData={undefined}
                selectedProductIds={selectedProductId ? [selectedProductId] : []}
                showConfidence={false}
              />
            )}
            
            {selectedProduct && dataPointCount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Summary: {selectedProduct.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{dataPointCount}</div>
                      <div className="text-sm text-muted-foreground">Data Points</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {filteredDemands.length > 0 
                          ? Math.round(filteredDemands.reduce((sum, d) => sum + d.quantity, 0) / filteredDemands.length)
                          : 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg. Quantity</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {filteredDemands.length > 0 
                          ? Math.max(...filteredDemands.map(d => d.quantity))
                          : 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Max Quantity</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {filteredDemands.length > 0 
                          ? Math.min(...filteredDemands.map(d => d.quantity))
                          : 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Min Quantity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Model Comparison Tab */}
          <TabsContent value="compare" className="space-y-4 mt-4">
            {!comparisonData && !modelComparison.isPending && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitCompare className="h-5 w-5" />
                    Model Comparison
                  </CardTitle>
                  <CardDescription>
                    Evaluate all 6 forecasting models using holdout validation on your historical data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <GitCompare className="h-16 w-16 text-muted-foreground/30" />
                    <div className="text-center max-w-md">
                      <h3 className="text-lg font-semibold mb-2">Compare Model Performance</h3>
                      <p className="text-sm text-muted-foreground">
                        This analysis will train and evaluate SMA, WMA, Exponential Smoothing, 
                        ARIMA, CatBoost ML, and Weighted Ensemble models on your data.
                        You&apos;ll see comprehensive metrics including MAE, RMSE, MAPE, Bias, MASE, and R².
                      </p>
                    </div>
                    <Button 
                      onClick={handleRunComparison} 
                      disabled={!selectedProductId}
                      size="lg"
                      className="mt-4"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Model Comparison
                    </Button>
                    {!selectedProductId && (
                      <p className="text-sm text-amber-600">Select a product to compare models</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {modelComparison.isPending && (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Comparing Models</h3>
                      <p className="text-sm text-muted-foreground">
                        Training and evaluating 6 forecasting models...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {comparisonData && (
              <ModelComparison 
                comparisonData={comparisonData}
                isLoading={false}
                error={null}
              />
            )}

            {modelComparison.isError && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="text-center text-destructive">
                    <p>Failed to compare models. Please try again.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={handleRunComparison}
                    >
                      Retry Comparison
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Forecast Results Tab */}
          <TabsContent value="forecast" className="space-y-4 mt-4">
            {!forecastData && !forecast.isPending && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Forecast Results
                  </CardTitle>
                  <CardDescription>
                    Generate demand predictions using the ensemble of all models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <TrendingUp className="h-16 w-16 text-muted-foreground/30" />
                    <div className="text-center max-w-md">
                      <h3 className="text-lg font-semibold mb-2">Generate Forecast</h3>
                      <p className="text-sm text-muted-foreground">
                        Create demand predictions for the next {forecastDays} days 
                        using a weighted ensemble of all forecasting models.
                      </p>
                    </div>
                    <Button 
                      onClick={handleGenerateForecast} 
                      disabled={!selectedProductId}
                      size="lg"
                      className="mt-4"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Generate Forecast
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {forecast.isPending && (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Generating Forecast</h3>
                      <p className="text-sm text-muted-foreground">
                        Analyzing data and creating predictions...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {forecastData && (
              <>
                <EnhancedDemandChart
                  demandData={filteredDemands}
                  forecastData={forecastData.forecastData}
                  selectedProductIds={selectedProductId ? [selectedProductId] : []}
                  showConfidence={true}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="h-5 w-5" />
                        Forecast Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MarkdownRenderer content={forecastData.summary} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Settings2 className="h-5 w-5" />
                        Model Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Models Used</div>
                        <div className="flex flex-wrap gap-2">
                          {forecastData.modelsUsed?.map((model, index) => (
                            <Badge key={index} variant="secondary">
                              {model}
                            </Badge>
                          )) || <span className="text-muted-foreground">Ensemble</span>}
                        </div>
                      </div>

                      {forecastData.confidence && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Confidence Level</div>
                          <div className="text-2xl font-bold text-primary">
                            {Math.round(forecastData.confidence * 100)}%
                          </div>
                        </div>
                      )}

                      {forecastData.metadata && (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                          <div>
                            <div className="text-sm text-muted-foreground">Data Points Used</div>
                            <div className="font-medium">{forecastData.metadata.dataPoints}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Forecast Horizon</div>
                            <div className="font-medium">{forecastData.metadata.forecastHorizon} days</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4 mt-4">
            {forecastData ? (
              <AdvancedAnalytics forecastData={forecastData} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Brain className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Generate a forecast first to see advanced analytics including 
                    trend analysis, seasonality patterns, and more.
                  </p>
                  <Button 
                    onClick={handleGenerateForecast} 
                    disabled={!selectedProductId}
                    className="mt-4"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Forecast
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4 mt-4">
            {forecastData ? (
              <ExportCapabilities
                forecastData={forecastData}
                productName={selectedProduct?.name || 'Selected Product'}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileDown className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Export Data</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Generate a forecast first to export the results in various formats 
                    (CSV, Excel, PDF).
                  </p>
                  <Button 
                    onClick={handleGenerateForecast} 
                    disabled={!selectedProductId}
                    className="mt-4"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Forecast
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
