"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Import Leaflet CSS for client-side only
if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css');
}

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock data for demonstration
const mockLocations = [
  { id: 1, name: 'Jakarta Warehouse', lat: -6.2088, lng: 106.8456, type: 'warehouse' },
  { id: 2, name: 'Customer A', lat: -6.2146, lng: 106.8451, type: 'customer' },
  { id: 3, name: 'Customer B', lat: -6.2038, lng: 106.8530, type: 'customer' },
  { id: 4, name: 'Customer C', lat: -6.2178, lng: 106.8520, type: 'customer' },
  { id: 5, name: 'Depot', lat: -6.2114, lng: 106.8417, type: 'depot' },
];

const getMarkerIcon = (type: string) => {
  const iconUrl = type === 'warehouse'
    ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png'
    : type === 'depot'
    ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'
    : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';

  return new L.Icon({
    iconUrl,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

export default function TrackingMap() {
  // Jakarta coordinates as center
  const center: [number, number] = [-6.2088, 106.8456];

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {mockLocations.map((location) => (
        <Marker
          key={location.id}
          position={[location.lat, location.lng]}
          icon={getMarkerIcon(location.type)}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{location.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{location.type}</p>
              {location.type === 'customer' && (
                <div className="mt-2 text-xs">
                  <p>Status: Pending delivery</p>
                  <p>ETA: 2 hours</p>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}