"use client";
import { useState } from "react";
import { ForecastControls } from "@/components/feature/forecast/ForecastControls";
import { DemandChart } from "@/components/feature/forecast/DemandChart";
import { useDemands } from "@/hooks/useApiHooks";
import { ForecastResponse } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ForecastPage() {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get all demand data for chart display
  const { data: allDemandsData } = useDemands({ limit: 1000 });

  const handleForecastGenerated = (forecast: ForecastResponse) => {
    setForecastData(forecast);
    setIsGenerating(false);
  };

  const handleForecastStart = () => {
    setIsGenerating(true);
    setForecastData(null);
  };

  const handleProductChange = (productId: string | null) => {
    setSelectedProductId(productId);
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Forecast Controls */}
        <div aria-label="Forecast Controls">
          <ForecastControls
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
                  <h3 className="text-lg font-semibold">Generating Forecast</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyzing historical data and running machine learning models...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chart */}
        <div className="w-full" aria-label="Demand Forecast Chart">
          <DemandChart
            demandData={allDemandsData?.data || []}
            forecastData={forecastData?.forecastData}
            selectedProductId={selectedProductId}
          />
        </div>

        {/* Forecast Summary */}
        {forecastData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Projection */}
            {forecastData.revenueProjection && (
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Revenue Projection</h3>
                <div className="space-y-2">
                  {forecastData.revenueProjection.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      <span className="font-medium">
                        ${item.projectedRevenue.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forecast Summary */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Forecast Summary</h3>
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: forecastData.summary.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
