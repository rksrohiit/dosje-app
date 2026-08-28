import React, { useState, useEffect } from 'react';
import { Camera, Maximize2, Download, Wifi, WifiOff } from 'lucide-react';

const CCTVViewer = () => {
  const [selectedNgo, setSelectedNgo] = useState('1');
  const [cameras, setCameras] = useState([
    { id: 1, name: 'Main Entrance', location: 'Gate 1', status: 'online' },
    { id: 2, name: 'Dining Hall', location: 'Block A', status: 'online' },
    { id: 3, name: 'Activity Room', location: 'Block B', status: 'online' },
    { id: 4, name: 'Corridor', location: 'Block C', status: 'offline' },
  ]);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="text-blue-600" /> Live CCTV Surveillance
          </h2>
          <p className="text-sm text-gray-500">Monitor live feeds for AI attendance and safety analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedNgo}
            onChange={(e) => setSelectedNgo(e.target.value)}
            className="border-gray-300 rounded-lg shadow-sm py-2 px-4 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
          >
            <option value="1">Hope Foundation - Delhi</option>
            <option value="2">Care India - Mumbai</option>
          </select>
          <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm border border-blue-100">
            {cameras.filter(c => c.status === 'online').length} / {cameras.length} Cameras Online
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cameras.map((cam) => (
          <div key={cam.id} className="bg-black rounded-xl overflow-hidden relative aspect-video border border-gray-800 shadow-lg group">
            {cam.status === 'online' ? (
              <>
                {/* Simulated live feed animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 animate-pulse opacity-50"></div>
                <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-black/50 text-white px-2 py-1 rounded text-xs font-mono">{cam.name}</span>
                      <p className="text-gray-300 text-xs mt-1 drop-shadow-md">{cam.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full"></div> LIVE
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-mono bg-black/50 px-2 py-1 rounded">{new Date().toLocaleDateString()} {time}</span>
                    <div className="flex gap-2">
                      <button className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white backdrop-blur-sm transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white backdrop-blur-sm transition-colors">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                <WifiOff className="w-12 h-12 text-gray-600 mb-2" />
                <span className="text-gray-500 font-medium">Camera Offline</span>
                <span className="text-gray-600 text-sm mt-1">{cam.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CCTVViewer;
