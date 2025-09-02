"use client";
import { InteractiveDataTable } from "@/components/feature/data-table/InteractiveDataTable";

export default function DataPage() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Data Table */}
        <div aria-label="Sales Data Table">
          <InteractiveDataTable />
        </div>
      </div>
    </div>
  );
}
