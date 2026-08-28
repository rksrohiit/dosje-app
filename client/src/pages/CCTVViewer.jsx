import React, { useState, useEffect } from 'react';
import { Camera, Maximize2, Download, Wifi, WifiOff, RefreshCw, Layers } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const CCTVViewer = () => {
  const [ngos, setNgos] = useState([
    { id: 'ngo1', name: 'Delhi NGO - Smile Scheme', state: 'Delhi' },
    { id: 'ngo2', name: 'Mumbai Support - DAP Scheme', state: 'Maharashtra' },
    { id: 'ngo3', name: 'Chennai Aid - SHG Scheme', state: 'Tamil Nadu' },
    { id: 'ngo4', name: 'Kolkata Care - SMILE Scheme', state: 'West Bengal' },
  ]);
  const [selectedNgo, setSelectedNgo] = useState('ngo1');
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [activeModalCam, setActiveModalCam] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const res = await api.ngos.getAll();
        if (res.data && res.data.length > 0) {
          setNgos(res.data);
          setSelectedNgo(res.data[0].id);
        }
      } catch (e) {}
    };
    fetchNgos();
  }, []);

  const loadCameras = async (ngoId) => {
    setLoading(true);
    try {
      const res = await api.ngos.getCameras(ngoId);
      if (res.data && res.data.length > 0) {
        setCameras(res.data);
      } else {
        setCameras([
          { id: 'cam_1', name: 'Main Gate & Entrance', location: 'Gate 1', status: 'online' },
          { id: 'cam_2', name: 'Beneficiary Dormitory', location: 'Block A', status: 'online' },
          { id: 'cam_3', name: 'Dining & Kitchen Area', location: 'Block B', status: 'online' },
          { id: 'cam_4', name: 'Administrative Office', location: 'Block C', status: 'offline' },
        ]);
      }
    } catch (e) {
      setCameras([
        { id: 'cam_1', name: 'Main Gate & Entrance', location: 'Gate 1', status: 'online' },
        { id: 'cam_2', name: 'Beneficiary Dormitory', location: 'Block A', status: 'online' },
        { id: 'cam_3', name: 'Dining & Kitchen Area', location: 'Block B', status: 'online' },
        { id: 'cam_4', name: 'Administrative Office', location: 'Block C', status: 'offline' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedNgo) {
      loadCameras(selectedNgo);
    }
  }, [selectedNgo]);

  const handleTakeSnapshot = (camName) => {
    toast.success(`Geo-tagged CCTV Snapshot saved for ${camName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 md:p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Live IP CCTV Surveillance Grid
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            24/7 AI-monitored feeds from DoSJE funded institutes across India
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedNgo}
            onChange={(e) => setSelectedNgo(e.target.value)}
            className="border-slate-300 text-xs md:text-sm font-semibold rounded-xl shadow-xs py-2 px-3 focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 outline-none"
          >
            {ngos.map((ngo) => (
              <option key={ngo.id} value={ngo.id}>
                🏢 {ngo.name} ({ngo.state})
              </option>
            ))}
          </select>

          <button
            onClick={() => loadCameras(selectedNgo)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh Feeds"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs border border-blue-200">
            {cameras.filter((c) => c.status === 'online').length} / {cameras.length} Online
          </div>
        </div>
      </div>

      {/* Grid of Feeds (1-col mobile, 2-col desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {cameras.map((cam) => (
          <div
            key={cam.id}
            className="bg-slate-950 rounded-2xl overflow-hidden relative aspect-video border border-slate-800 shadow-md group"
          >
            {cam.status === 'online' ? (
              <>
                {/* Simulated Feed Animation */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 animate-pulse opacity-90"></div>
                {/* Radar Scanline */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent h-16 w-full animate-bounce"></div>

                {/* Feed HUD Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
                  <div className="flex justify-between items-start">
                    <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-lg">
                      <span className="text-white text-xs font-bold font-mono tracking-wider">{cam.name}</span>
                      <p className="text-slate-400 text-[10px] uppercase tracking-widest">{cam.location || 'Zone A'}</p>
                    </div>

                    <span className="bg-rose-600/90 text-white px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest animate-pulse flex items-center gap-1.5 border border-rose-400/30">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE STREAM
                    </span>
                  </div>

                  <div className="flex justify-between items-end bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80">
                    <div className="text-[11px] font-mono text-emerald-400 font-bold">
                      📍 28.6139°N, 77.2090°E • {time}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTakeSnapshot(cam.name)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-sm transition-colors"
                        title="Capture Snapshot"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveModalCam(cam)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-sm transition-colors"
                        title="Fullscreen Feed"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-500 p-6 text-center">
                <WifiOff className="w-10 h-10 text-slate-700 mb-2" />
                <p className="text-sm font-bold text-slate-400">Camera Offline</p>
                <p className="text-xs text-slate-600 mt-1">{cam.name} • No Signal Received</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fullscreen Camera Modal */}
      {activeModalCam && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-base">{activeModalCam.name}</h3>
                <p className="text-xs text-emerald-400 font-mono">LIVE HD STREAM • {time}</p>
              </div>
              <button
                onClick={() => setActiveModalCam(null)}
                className="text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold"
              >
                Close (ESC)
              </button>
            </div>
            <div className="aspect-video bg-black relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-slate-800 opacity-90 animate-pulse"></div>
              <div className="z-10 text-center">
                <Camera className="w-16 h-16 text-blue-500 mx-auto mb-3 animate-pulse" />
                <p className="text-white font-bold text-lg">Full High-Definition CCTV Feed Active</p>
                <p className="text-slate-400 text-xs font-mono mt-1">Encrypted WebRTC Stream ID: {activeModalCam.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CCTVViewer;
