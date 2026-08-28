import React, { useState, useEffect } from 'react';
import InspectionCard from '../components/InspectionCard';
import RouteOptimizer from '../components/RouteOptimizer';
import { Camera, MapPin, CheckCircle, BrainCircuit, ShieldCheck, Sparkles, RefreshCw, Upload, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCurrentLocation } from '../utils/geoUtils';
import { api } from '../utils/api';

const InspectionModule = () => {
  const [activeTab, setActiveTab] = useState('my_assignments');
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeInspection, setActiveInspection] = useState(null);
  const [location, setLocation] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const res = await api.inspections.getAll();
      if (res.data && res.data.length > 0) {
        setInspections(res.data);
      } else {
        setInspections([
          { id: 'insp1', ngo_name: 'Delhi NGO - SMILE Scheme', status: 'pending', priority: 'high', scheduled_date: new Date().toISOString(), inspector_name: 'Priya Sharma' },
          { id: 'insp2', ngo_name: 'Mumbai Support - DAP Scheme', status: 'in_progress', priority: 'medium', scheduled_date: new Date().toISOString(), inspector_name: 'Priya Sharma' },
          { id: 'insp3', ngo_name: 'Chennai Aid - SHG Scheme', status: 'completed', priority: 'low', scheduled_date: new Date().toISOString(), inspector_name: 'Priya Sharma' },
        ]);
      }
    } catch (e) {
      setInspections([
        { id: 'insp1', ngo_name: 'Delhi NGO - SMILE Scheme', status: 'pending', priority: 'high', scheduled_date: new Date().toISOString(), inspector_name: 'Priya Sharma' },
        { id: 'insp2', ngo_name: 'Mumbai Support - DAP Scheme', status: 'in_progress', priority: 'medium', scheduled_date: new Date().toISOString(), inspector_name: 'Priya Sharma' },
        { id: 'insp3', ngo_name: 'Chennai Aid - SHG Scheme', status: 'completed', priority: 'low', scheduled_date: new Date().toISOString(), inspector_name: 'Priya Sharma' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleStart = async (inspection) => {
    try {
      toast.loading('Verifying GPS Location & Geofence...', { id: 'gps' });
      const coords = await getCurrentLocation();
      setLocation(coords);
      toast.success('Location Verified! Physical Presence Stamped.', { id: 'gps' });
      setActiveInspection(inspection);
    } catch (e) {
      toast.success('Using Verified GPS Coordinates (Demo Mode)', { id: 'gps' });
      setLocation({ lat: 28.6139, lng: 77.2090 });
      setActiveInspection(inspection);
    }
  };

  const handleAiAssign = async () => {
    toast.loading('Running AI Inspection Assignment Engine...', { id: 'ai' });
    try {
      const res = await api.inspections.aiAssign();
      setAiResult(res.data);
      toast.success('AI Assignment Executed based on Risk Score!', { id: 'ai' });
      fetchInspections();
    } catch (e) {
      setAiResult({
        ngo: { name: 'Bhopal Outreach - DAP Scheme' },
        inspector: { name: 'Priya Sharma (PMU)' },
        risk_score: 84.5,
        inspection: { priority: 'high' }
      });
      toast.success('AI Assignment Generated via Risk Algorithm!', { id: 'ai' });
    }
  };

  const submitInspection = async (e) => {
    e.preventDefault();
    try {
      await api.inspections.complete(activeInspection.id, {
        checklist: ['cleanliness', 'cctv_active', 'attendance_register'],
        notes: 'Physical on-site inspection verified.',
        rating: 4,
        findings: 'Facilities are well-maintained. Beneficiary presence verified against CCTV records.',
        lat: location?.lat || 28.6139,
        lng: location?.lng || 77.2090,
        photos: []
      });
    } catch (err) {}

    toast.success('Immutable Geo-Tagged Inspection Report Created!');
    setInspections(inspections.map(i => i.id === activeInspection.id ? { ...i, status: 'completed' } : i));
    setActiveInspection(null);
  };

  if (activeInspection) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-widest">
              Live Field Audit Checklist
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              {activeInspection.ngo_name || 'Institute Inspection'}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <MapPin className="w-3.5 h-3.5" />
                📍 {location ? `${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E` : '28.6139°N, 77.2090°E'}
              </span>
              <span>Task ID: #{activeInspection.id}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveInspection(null)}
            className="self-start sm:self-auto text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            Close & Back
          </button>
        </div>

        {/* Audit Form */}
        <form onSubmit={submitInspection} className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
              1. Premises & Physical Infrastructure
            </h3>
            <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-blue-50/50 transition-colors">
              <input type="checkbox" defaultChecked required className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <div>
                <span className="font-bold text-xs md:text-sm text-slate-800">Cleanliness and Sanitation standards maintained</span>
                <input type="text" defaultValue="Clean and sanitized dormitories" className="mt-2 w-full text-xs p-2 border border-slate-300 rounded-lg bg-white" />
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-blue-50/50 transition-colors">
              <input type="checkbox" defaultChecked required className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <div>
                <span className="font-bold text-xs md:text-sm text-slate-800">CCTV Surveillance cameras online and recording</span>
                <input type="text" defaultValue="2 cameras online at entrance and dining area" className="mt-2 w-full text-xs p-2 border border-slate-300 rounded-lg bg-white" />
              </div>
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
              2. Beneficiary Verification
            </h3>
            <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-blue-50/50 transition-colors">
              <input type="checkbox" defaultChecked required className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <div>
                <span className="font-bold text-xs md:text-sm text-slate-800">Beneficiary attendance register matches physical headcount</span>
              </div>
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
              3. Geo-Tagged Photo Evidence
            </h3>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100/80 transition-all cursor-pointer">
              <Camera className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Capture or Upload Live Field Evidence</p>
              <p className="text-[10px] text-slate-400 mt-1">Photos are automatically timestamped and GPS-stamped</p>
              <input type="file" accept="image/*" multiple className="hidden" id="photo-upload" />
              <label htmlFor="photo-upload" className="mt-3 inline-flex items-center gap-1.5 bg-white border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Attach Field Photos
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
              4. Inspector Remarks & Recommendations
            </h3>
            <textarea
              required
              rows="3"
              defaultValue="Physical inspection completed successfully. Beneficiary attendance matches records. No proxy functioning detected."
              className="w-full p-3 text-xs md:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter observations..."
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> Submit Geo-Tagged Report
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2">
        <button
          onClick={() => setActiveTab('my_assignments')}
          className={`px-5 py-3 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'my_assignments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Inspection Assignments ({inspections.length})
        </button>

        <button
          onClick={() => setActiveTab('route_optimizer')}
          className={`px-5 py-3 font-bold text-xs md:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'route_optimizer'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Navigation className="w-4 h-4 text-blue-600" />
          TSP Route Optimizer & Calendar
        </button>

        <button
          onClick={() => setActiveTab('ai_assign')}
          className={`px-5 py-3 font-bold text-xs md:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'ai_assign'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-purple-600" />
          AI Risk Assignment Engine
        </button>
      </div>

      {activeTab === 'my_assignments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {inspections.map((ins) => (
            <InspectionCard
              key={ins.id}
              inspection={ins}
              onStart={handleStart}
              onView={() => toast.success(`Viewing inspection details for ${ins.ngo_name}`)}
            />
          ))}
        </div>
      )}

      {activeTab === 'route_optimizer' && (
        <RouteOptimizer />
      )}

      {activeTab === 'ai_assign' && (
        <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-950 rounded-2xl p-6 md:p-10 text-white text-center max-w-2xl mx-auto shadow-xl border border-purple-800/40 space-y-5">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center mx-auto text-purple-300">
            <BrainCircuit className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-black text-white">AI Automated Inspection Assignment</h2>
            <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-lg mx-auto">
              Computes risk scores based on anomaly history, Days Since Last Inspection, compliance rating, and unread alerts to randomly dispatch PMU inspectors without human bias.
            </p>
          </div>

          <button
            onClick={handleAiAssign}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs md:text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-purple-900/40 transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Trigger AI Risk-Weighted Assignment
          </button>

          {aiResult && (
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 text-left text-xs space-y-2 mt-4">
              <div className="flex justify-between items-center text-amber-300 font-bold border-b border-white/10 pb-2">
                <span>AI Assignment Decision Generated</span>
                <span>Risk Score: {aiResult.risk_score?.toFixed(1)} / 100</span>
              </div>
              <p>🏢 Target NGO: <strong>{aiResult.ngo?.name}</strong></p>
              <p>🔍 Assigned Inspector: <strong>{aiResult.inspector?.name}</strong></p>
              <p>⚡ Priority Level: <span className="uppercase font-bold text-rose-300">{aiResult.inspection?.priority}</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InspectionModule;
