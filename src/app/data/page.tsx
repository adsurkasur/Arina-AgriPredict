"use client";
import { InteractiveDataTable } from "@/components/feature/data-table/InteractiveDataTable";
import { AIDataInput } from "@/components/feature/data-table/AIDataInput";
import { DataSummary } from "@/components/feature/data-table/DataSummary";

export default function DataPage() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Data Summary Dashboard */}
        <div aria-label="Data Summary Dashboard">
          <DataSummary />
        </div>

        {/* AI Data Input */}
        <div aria-label="AI Data Input">
          <AIDataInput />
        </div>

        {/* Data Table */}
        <div aria-label="Sales Data Table">
          <InteractiveDataTable />
        </div>
      </div>
    </div>
  );
}
