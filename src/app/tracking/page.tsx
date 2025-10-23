"use client";
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues with Leaflet
const TrackingMap = dynamic(() => import('../../components/feature/tracking/TrackingMap'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading map...</div>
});

export default function TrackingPage() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Tracking and Route Optimization</h1>
          <p className="text-muted-foreground">
            Track deliveries and optimize routes using vehicle routing problem algorithms
          </p>
        </div>

        {/* Map Container */}
        <div className="bg-card rounded-lg border p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Delivery Tracking Map</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Optimize Route
                </button>
                <button className="px-4 py-2 border rounded-md hover:bg-muted">
                  Add Delivery Point
                </button>
              </div>
            </div>

            {/* Map Component */}
            <div className="w-full h-96 rounded-lg overflow-hidden border">
              <TrackingMap />
            </div>

            {/* Mock Supply Chain Entities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Warehouse</h3>
                <p className="text-sm text-muted-foreground">Central distribution center</p>
                <div className="mt-2 text-xs">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Jakarta Warehouse
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Delivery Vehicles</h3>
                <p className="text-sm text-muted-foreground">Fleet status and capacity</p>
                <div className="mt-2 space-y-1 text-xs">
                  <div><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>Truck A - Available</div>
                  <div><span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>Truck B - In Transit</div>
                  <div><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>Truck C - Maintenance</div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Delivery Points</h3>
                <p className="text-sm text-muted-foreground">Customer locations</p>
                <div className="mt-2 space-y-1 text-xs">
                  <div><span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>12 active deliveries</div>
                  <div><span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>3 pending routes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}