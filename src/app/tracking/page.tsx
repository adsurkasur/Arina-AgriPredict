"use client";
import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, 
  Truck, 
  Package, 
  Route as RouteIcon, 
  Plus, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Warehouse,
  Target,
  Trash2,
  RefreshCw
} from 'lucide-react';

// Dynamically import the map component to avoid SSR issues with Leaflet
const TrackingMap = dynamic(() => import('../../components/feature/tracking/TrackingMap'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading map...</div>
});

// Types
interface DeliveryPoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: 'pending' | 'in-transit' | 'delivered' | 'failed';
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: string;
  actualTime?: string;
  notes?: string;
}

interface Vehicle {
  id: string;
  name: string;
  driver: string;
  status: 'available' | 'in-transit' | 'maintenance' | 'offline';
  capacity: number;
  currentLoad: number;
  location?: { lat: number; lng: number };
  assignedRoute?: string;
}

interface RouteOptimization {
  id: string;
  name: string;
  vehicleId: string;
  deliveryPoints: string[];
  totalDistance: number;
  estimatedDuration: string;
  status: 'planned' | 'active' | 'completed';
}

// Mock data
const initialDeliveries: DeliveryPoint[] = [
  { id: 'd1', name: 'Farm Fresh Market', address: 'Jl. Sudirman No. 123, Jakarta', lat: -6.2146, lng: 106.8451, status: 'pending', priority: 'high', estimatedTime: '09:00', notes: 'Requires refrigeration' },
  { id: 'd2', name: 'Green Grocers', address: 'Jl. Gatot Subroto No. 45, Jakarta', lat: -6.2038, lng: 106.8530, status: 'in-transit', priority: 'medium', estimatedTime: '10:30' },
  { id: 'd3', name: 'Super Indo Pondok Indah', address: 'Jl. Metro Pondok Indah, Jakarta', lat: -6.2178, lng: 106.8520, status: 'delivered', priority: 'low', estimatedTime: '08:00', actualTime: '07:45' },
  { id: 'd4', name: 'Farmers Market Kemang', address: 'Jl. Kemang Raya No. 88, Jakarta', lat: -6.2200, lng: 106.8180, status: 'pending', priority: 'high', estimatedTime: '11:00' },
  { id: 'd5', name: 'Organic Store Senayan', address: 'Jl. Asia Afrika, Senayan, Jakarta', lat: -6.2250, lng: 106.8050, status: 'failed', priority: 'medium', estimatedTime: '12:00', notes: 'Customer unavailable' },
];

const initialVehicles: Vehicle[] = [
  { id: 'v1', name: 'Truck A', driver: 'Budi Santoso', status: 'available', capacity: 1000, currentLoad: 0, location: { lat: -6.2088, lng: 106.8456 } },
  { id: 'v2', name: 'Truck B', driver: 'Andi Wijaya', status: 'in-transit', capacity: 1500, currentLoad: 800, location: { lat: -6.2100, lng: 106.8500 }, assignedRoute: 'route-1' },
  { id: 'v3', name: 'Van C', driver: 'Dewi Lestari', status: 'maintenance', capacity: 500, currentLoad: 0 },
  { id: 'v4', name: 'Truck D', driver: 'Rizki Pratama', status: 'available', capacity: 1200, currentLoad: 0, location: { lat: -6.2050, lng: 106.8400 } },
];

const initialRoutes: RouteOptimization[] = [
  { id: 'route-1', name: 'Morning Route - North', vehicleId: 'v2', deliveryPoints: ['d1', 'd2'], totalDistance: 15.5, estimatedDuration: '2h 30m', status: 'active' },
  { id: 'route-2', name: 'Afternoon Route - South', vehicleId: '', deliveryPoints: ['d4', 'd5'], totalDistance: 12.3, estimatedDuration: '1h 45m', status: 'planned' },
];

export default function TrackingPage() {
  const [deliveries, setDeliveries] = useState<DeliveryPoint[]>(initialDeliveries);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [routes, setRoutes] = useState<RouteOptimization[]>(initialRoutes);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isAddingDelivery, setIsAddingDelivery] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [newDelivery, setNewDelivery] = useState<Partial<DeliveryPoint>>({
    name: '',
    address: '',
    priority: 'medium',
    lat: -6.2088,
    lng: 106.8456,
  });

  // Statistics
  const stats = useMemo(() => ({
    totalDeliveries: deliveries.length,
    pending: deliveries.filter(d => d.status === 'pending').length,
    inTransit: deliveries.filter(d => d.status === 'in-transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    failed: deliveries.filter(d => d.status === 'failed').length,
    availableVehicles: vehicles.filter(v => v.status === 'available').length,
    activeRoutes: routes.filter(r => r.status === 'active').length,
  }), [deliveries, vehicles, routes]);

  const handleOptimizeRoutes = useCallback(async () => {
    setIsOptimizing(true);
    // Simulate route optimization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create optimized route from pending deliveries
    const pendingDeliveries = deliveries.filter(d => d.status === 'pending');
    if (pendingDeliveries.length > 0) {
      const newRoute: RouteOptimization = {
        id: `route-${Date.now()}`,
        name: `Optimized Route - ${new Date().toLocaleTimeString()}`,
        vehicleId: '',
        deliveryPoints: pendingDeliveries.map(d => d.id),
        totalDistance: Math.round(Math.random() * 20 + 10),
        estimatedDuration: `${Math.floor(Math.random() * 3) + 1}h ${Math.floor(Math.random() * 60)}m`,
        status: 'planned',
      };
      setRoutes(prev => [...prev, newRoute]);
    }
    setIsOptimizing(false);
  }, [deliveries]);

  const handleAddDelivery = useCallback(() => {
    if (newDelivery.name && newDelivery.address) {
      const delivery: DeliveryPoint = {
        id: `d${Date.now()}`,
        name: newDelivery.name,
        address: newDelivery.address,
        lat: newDelivery.lat || -6.2088 + (Math.random() - 0.5) * 0.05,
        lng: newDelivery.lng || 106.8456 + (Math.random() - 0.5) * 0.05,
        status: 'pending',
        priority: (newDelivery.priority as 'low' | 'medium' | 'high') || 'medium',
        estimatedTime: newDelivery.estimatedTime,
        notes: newDelivery.notes,
      };
      setDeliveries(prev => [...prev, delivery]);
      setNewDelivery({ name: '', address: '', priority: 'medium', lat: -6.2088, lng: 106.8456 });
      setIsAddingDelivery(false);
    }
  }, [newDelivery]);

  const handleDeleteDelivery = useCallback((id: string) => {
    setDeliveries(prev => prev.filter(d => d.id !== id));
  }, []);

  const handleUpdateDeliveryStatus = useCallback((id: string, status: DeliveryPoint['status']) => {
    setDeliveries(prev => prev.map(d => 
      d.id === id ? { ...d, status, actualTime: status === 'delivered' ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : d.actualTime } : d
    ));
  }, []);

  const handleAssignVehicle = useCallback((routeId: string, vehicleId: string) => {
    setRoutes(prev => prev.map(r => 
      r.id === routeId ? { ...r, vehicleId, status: 'active' } : r
    ));
    setVehicles(prev => prev.map(v =>
      v.id === vehicleId ? { ...v, status: 'in-transit', assignedRoute: routeId } : v
    ));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in-transit': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'available': return 'bg-green-500';
      case 'maintenance': return 'bg-orange-500';
      case 'offline': return 'bg-gray-500';
      case 'planned': return 'bg-purple-500';
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="secondary">Medium</Badge>;
      case 'low': return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Tracking & Route Optimization</h1>
            <p className="text-muted-foreground">
              Manage deliveries, track vehicles, and optimize distribution routes
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleOptimizeRoutes} 
              disabled={isOptimizing}
              className="gap-2"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <RouteIcon className="h-4 w-4" />
                  Optimize Routes
                </>
              )}
            </Button>
            <Dialog open={isAddingDelivery} onOpenChange={setIsAddingDelivery}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Delivery
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Delivery Point</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new delivery location.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Location Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g., Farm Fresh Market"
                      value={newDelivery.name || ''}
                      onChange={(e) => setNewDelivery(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      placeholder="e.g., Jl. Sudirman No. 123, Jakarta"
                      value={newDelivery.address || ''}
                      onChange={(e) => setNewDelivery(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={newDelivery.priority || 'medium'}
                        onValueChange={(value) => setNewDelivery(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Estimated Time</Label>
                      <Input 
                        id="time" 
                        type="time"
                        value={newDelivery.estimatedTime || ''}
                        onChange={(e) => setNewDelivery(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input 
                      id="notes" 
                      placeholder="e.g., Requires refrigeration"
                      value={newDelivery.notes || ''}
                      onChange={(e) => setNewDelivery(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleAddDelivery} className="w-full">
                    Add Delivery Point
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
              <p className="text-xs text-muted-foreground">Total Deliveries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Navigation className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{stats.inTransit}</p>
              <p className="text-xs text-muted-foreground">In Transit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{stats.delivered}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold">{stats.failed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Truck className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{stats.availableVehicles}</p>
              <p className="text-xs text-muted-foreground">Available Vehicles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{stats.activeRoutes}</p>
              <p className="text-xs text-muted-foreground">Active Routes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Map Overview</span>
              <span className="sm:hidden">Map</span>
            </TabsTrigger>
            <TabsTrigger value="deliveries" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Deliveries</span>
              <span className="sm:hidden">Del.</span>
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="gap-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Vehicles</span>
              <span className="sm:hidden">Veh.</span>
            </TabsTrigger>
            <TabsTrigger value="routes" className="gap-2">
              <RouteIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Routes</span>
              <span className="sm:hidden">Rte.</span>
            </TabsTrigger>
          </TabsList>

          {/* Map Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Tracking Map
                </CardTitle>
                <CardDescription>
                  Real-time view of all delivery points and vehicle locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[500px] rounded-lg overflow-hidden border relative" style={{ zIndex: 0 }}>
                  <TrackingMap />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Below Map */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-blue-500" />
                    Warehouse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Central Distribution Center</p>
                  <p className="text-xs mt-1">Jakarta Warehouse - Active</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="h-4 w-4 text-green-500" />
                    Fleet Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {vehicles.slice(0, 3).map(v => (
                    <div key={v.id} className="flex items-center justify-between text-sm">
                      <span>{v.name}</span>
                      <Badge variant={v.status === 'available' ? 'default' : 'secondary'} className="text-xs">
                        {v.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-500" />
                    Next Deliveries
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {deliveries.filter(d => d.status === 'pending').slice(0, 3).map(d => (
                    <div key={d.id} className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[120px]">{d.name}</span>
                      <span className="text-xs text-muted-foreground">{d.estimatedTime}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deliveries Tab */}
          <TabsContent value="deliveries">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Delivery Points
                </CardTitle>
                <CardDescription>
                  Manage all delivery locations and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(delivery.status)}`} />
                        <div>
                          <p className="font-medium">{delivery.name}</p>
                          <p className="text-sm text-muted-foreground">{delivery.address}</p>
                          {delivery.notes && (
                            <p className="text-xs text-muted-foreground mt-1">📝 {delivery.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {getPriorityBadge(delivery.priority)}
                          <div className="text-xs text-muted-foreground mt-1">
                            {delivery.status === 'delivered' ? (
                              <span className="text-green-600">Delivered at {delivery.actualTime}</span>
                            ) : (
                              <span>ETA: {delivery.estimatedTime || 'TBD'}</span>
                            )}
                          </div>
                        </div>
                        <Select 
                          value={delivery.status}
                          onValueChange={(value) => handleUpdateDeliveryStatus(delivery.id, value as DeliveryPoint['status'])}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-transit">In Transit</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDelivery(delivery.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Fleet Management
                </CardTitle>
                <CardDescription>
                  Monitor vehicle status, capacity, and assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              vehicle.status === 'available' ? 'bg-green-100 dark:bg-green-900' :
                              vehicle.status === 'in-transit' ? 'bg-blue-100 dark:bg-blue-900' :
                              vehicle.status === 'maintenance' ? 'bg-orange-100 dark:bg-orange-900' :
                              'bg-gray-100 dark:bg-gray-900'
                            }`}>
                              <Truck className={`h-5 w-5 ${
                                vehicle.status === 'available' ? 'text-green-600' :
                                vehicle.status === 'in-transit' ? 'text-blue-600' :
                                vehicle.status === 'maintenance' ? 'text-orange-600' :
                                'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium">{vehicle.name}</p>
                              <p className="text-sm text-muted-foreground">{vehicle.driver}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(vehicle.status)}>
                            {vehicle.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Capacity</span>
                            <span>{vehicle.currentLoad}/{vehicle.capacity} kg</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${(vehicle.currentLoad / vehicle.capacity) * 100}%` }}
                            />
                          </div>
                          {vehicle.assignedRoute && (
                            <div className="flex justify-between text-sm mt-2">
                              <span className="text-muted-foreground">Assigned Route</span>
                              <span className="text-primary">{routes.find(r => r.id === vehicle.assignedRoute)?.name || 'Unknown'}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RouteIcon className="h-5 w-5" />
                  Route Management
                </CardTitle>
                <CardDescription>
                  View and manage optimized delivery routes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routes.map((route) => (
                    <div key={route.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{route.name}</h3>
                            <Badge className={getStatusColor(route.status)}>
                              {route.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {route.deliveryPoints.length} stops • {route.totalDistance} km • {route.estimatedDuration}
                          </p>
                        </div>
                        {route.status === 'planned' && !route.vehicleId && (
                          <Select onValueChange={(value) => handleAssignVehicle(route.id, value)}>
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Assign Vehicle" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicles.filter(v => v.status === 'available').map(v => (
                                <SelectItem key={v.id} value={v.id}>{v.name} - {v.driver}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {route.vehicleId && (
                          <div className="text-right">
                            <p className="text-sm font-medium">{vehicles.find(v => v.id === route.vehicleId)?.name}</p>
                            <p className="text-xs text-muted-foreground">{vehicles.find(v => v.id === route.vehicleId)?.driver}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {route.deliveryPoints.map((pointId, index) => {
                          const point = deliveries.find(d => d.id === pointId);
                          return point ? (
                            <div key={pointId} className="flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded">
                              <span className="text-muted-foreground">{index + 1}.</span>
                              <span>{point.name}</span>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(point.status)}`} />
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                  {routes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <RouteIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No routes created yet</p>
                      <p className="text-sm">Click &quot;Optimize Routes&quot; to create optimized delivery routes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}