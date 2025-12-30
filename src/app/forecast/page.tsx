"use client";
import { useState } from "react";
import { AdvancedForecastControls } from "@/components/feature/forecast/controls";
import { EnhancedDemandChart } from "@/components/feature/forecast/enhanced-demand-chart";
import { ExportCapabilities } from "@/components/feature/forecast/export";
import { AdvancedAnalytics } from "@/components/feature/forecast/AdvancedAnalytics";
import { RealTimeDataStreaming } from "@/components/feature/forecast/realtime";
import { ModelComparison } from "@/components/feature/forecast/model-comparison";
import { useDemands, useModelComparison } from "@/hooks/useApiHooks";
import { ForecastResponse, ComparisonResponse } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { Loader2, BarChart3, TrendingUp, Target, Brain, Activity, GitCompare, Play } from "lucide-react";

export default function ForecastPage() {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get all demand data for chart display
  const { data: allDemandsData } = useDemands({ limit: 1000 });
  
  // Model comparison mutation
  const modelComparison = useModelComparison();

  const handleForecastGenerated = (forecast: ForecastResponse) => {
    setForecastData(forecast);
    setIsGenerating(false);
  };

  const handleForecastStart = () => {
    setIsGenerating(true);
    setForecastData(null);
  };

  const handleProductChange = (productIds: string[]) => {
    setSelectedProductIds(productIds);
    // Reset comparison when product changes
    setComparisonData(null);
  };

  const handleRunComparison = () => {
    if (selectedProductIds.length === 0) return;
    
    modelComparison.mutate(
      {
        productId: selectedProductIds[0], // Compare for first selected product
        days: forecastData?.forecastData?.length || 30,
        includeEnsemble: true,
      },
      {
        onSuccess: (data) => {
          setComparisonData(data);
        },
      }
    );
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Advanced Forecast Controls */}
        <div aria-label="Advanced Forecast Controls">
          <AdvancedForecastControls
            onForecastGenerated={handleForecastGenerated}
            onProductChange={handleProductChange}
            onForecastStart={handleForecastStart}
          />
        </div>

        {/* Loading State */}
        {isGenerating && (
          <Card className="w-full">
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Generating Advanced Forecast</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyzing historical data with multiple ML models...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Chart */}
        <div className="w-full" aria-label="Enhanced Demand Forecast Chart">
          <EnhancedDemandChart
            demandData={allDemandsData?.data || []}
            forecastData={forecastData?.forecastData}
            selectedProductIds={selectedProductIds}
            showConfidence={true}
          />
        </div>

        {/* Enhanced Results Dashboard */}
        {forecastData && (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="comparison">
                <GitCompare className="h-4 w-4 mr-1" />
                Compare
              </TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="analytics">
                <Brain className="h-4 w-4 mr-1" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="streaming">
                <Activity className="h-4 w-4 mr-1" />
                Live Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Forecast Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MarkdownRenderer content={forecastData.summary} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              {!comparisonData && !modelComparison.isPending && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GitCompare className="h-5 w-5 mr-2" />
                      Model Comparison
                    </CardTitle>
                    <CardDescription>
                      Compare all 6 forecasting models (SMA, WMA, ES, ARIMA, CatBoost, Ensemble) 
                      to see which performs best on your data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                      <GitCompare className="h-16 w-16 text-muted-foreground/50" />
                      <div className="text-center">
                        <h3 className="text-lg font-semibold">Run Model Comparison</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          This will evaluate all forecasting models on your historical data using 
                          holdout validation and calculate comprehensive accuracy metrics 
                          (MAE, RMSE, MAPE, Bias, MASE, R²).
                        </p>
                      </div>
                      <Button 
                        onClick={handleRunComparison} 
                        disabled={selectedProductIds.length === 0}
                        size="lg"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Compare Models
                      </Button>
                      {selectedProductIds.length === 0 && (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          Please select a product first
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {modelComparison.isPending && (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <div className="text-center">
                        <h3 className="text-lg font-semibold">Comparing Models</h3>
                        <p className="text-sm text-muted-foreground">
                          Evaluating SMA, WMA, ES, ARIMA, CatBoost, and Ensemble models...
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

            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Revenue Projection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {forecastData.revenueProjection && forecastData.revenueProjection.length > 0 ? (
                    <div className="space-y-2">
                      {forecastData.revenueProjection.slice(0, 10).map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.date).toLocaleDateString('en-GB')}
                          </span>
                          <div className="text-right">
                            <div className="font-medium">
                              ${item.projectedRevenue.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.projectedQuantity.toFixed(1)} units @ ${item.sellingPrice.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No revenue projection data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="models" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Model Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Models Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {forecastData.modelsUsed?.map((model, index) => (
                          <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                            {model}
                          </span>
                        )) || <span className="text-muted-foreground">No model information available</span>}
                      </div>
                    </div>

                    {forecastData.metadata && (
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <div className="text-sm text-muted-foreground">Data Points</div>
                          <div className="font-medium">{forecastData.metadata.dataPoints}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Forecast Horizon</div>
                          <div className="font-medium">{forecastData.metadata.forecastHorizon} days</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Forecast Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {forecastData.confidence ? `${Math.round(forecastData.confidence * 100)}%` : 'N/A'}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on historical data patterns
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scenario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-medium capitalize">
                      {forecastData.scenario || 'Realistic'}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Forecast scenario applied
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <ExportCapabilities
                forecastData={forecastData}
                productName={selectedProductIds.length > 0 ? `Selected Products (${selectedProductIds.length})` : 'All Products'}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <AdvancedAnalytics
                forecastData={forecastData}
              />
            </TabsContent>

            <TabsContent value="streaming" className="space-y-4">
              <RealTimeDataStreaming
                forecastData={forecastData}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
