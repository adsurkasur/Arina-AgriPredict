"use client";
import { useState } from "react";
import { ForecastControls } from "@/components/feature/forecast/ForecastControls";
import { DemandChart } from "@/components/feature/forecast/DemandChart";
import { useDemands } from "@/hooks/useApiHooks";
import { ForecastResponse } from "@/types/api";

export default function ForecastPage() {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [selectedProductId] = useState<string | null>(null);

  // Get all demand data for chart display
  const { data: allDemandsData } = useDemands({ limit: 1000 });

  const handleForecastGenerated = (forecast: ForecastResponse) => {
    setForecastData(forecast);
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Forecast Controls */}
        <div aria-label="Forecast Controls">
          <ForecastControls
            onForecastGenerated={handleForecastGenerated}
          />
        </div>

        {/* Chart */}
        <div className="w-full" aria-label="Demand Forecast Chart">
          <DemandChart
            demandData={allDemandsData?.data || []}
            forecastData={forecastData?.forecastData}
            selectedProductId={selectedProductId}
          />
        </div>
      </div>
    </div>
  );
}
