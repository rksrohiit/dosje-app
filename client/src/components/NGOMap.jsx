import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../utils/api';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const NGOMap = () => {
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    // Mock fetch
    const fetchMapData = async () => {
      try {
        const res = await api.dashboard.getMapData();
        setNgos(res.data);
      } catch (e) {
        setNgos([
          { id: 1, name: 'Hope Foundation', lat: 28.6139, lng: 77.2090, score: 92, status: 'Active' },
          { id: 2, name: 'Care India', lat: 19.0760, lng: 72.8777, score: 65, status: 'Active' },
          { id: 3, name: 'HelpAge', lat: 13.0827, lng: 80.2707, score: 45, status: 'Review' },
        ]);
      }
    };
    fetchMapData();
  }, []);

  const getMarkerColor = (score) => {
    if (score > 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm z-0 relative">
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {ngos.map((ngo) => (
          <Marker 
            key={ngo.id} 
            position={[ngo.lat, ngo.lng]}
            icon={createCustomIcon(getMarkerColor(ngo.score))}
          >
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-gray-900">{ngo.name}</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-gray-500">Compliance:</span> <span className="font-medium">{ngo.score}%</span></p>
                  <p><span className="text-gray-500">Status:</span> <span className="font-medium">{ngo.status}</span></p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default NGOMap;
