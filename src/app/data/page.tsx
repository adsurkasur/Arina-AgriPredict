"use client";
import { useState } from "react";
import { InteractiveDataTable } from "@/components/feature/data-table/InteractiveDataTable";
import { DemandChart } from "@/components/feature/forecast/DemandChart";
import { useDemands } from "@/hooks/useApiHooks";
import { ForecastResponse } from "@/types/api";

export default function DataPage() {
  const [forecastData] = useState<ForecastResponse | null>(null);
  const [selectedProductId] = useState<string | null>(null);

  // Get all demand data for chart display
  const { data: allDemandsData } = useDemands({ limit: 1000 });

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Data Table */}
        <div aria-label="Sales Data Table">
          <InteractiveDataTable />
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
