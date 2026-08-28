import React, { useState } from 'react';
import InspectionCard from '../components/InspectionCard';
import { Camera, MapPin, CheckCircle, BrainCircuit } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCurrentLocation } from '../utils/geoUtils';

const InspectionModule = () => {
  const [activeTab, setActiveTab] = useState('my_assignments');
  const [inspections, setInspections] = useState([
    { id: 101, ngo_name: 'Hope Foundation', status: 'pending', priority: 'high', scheduled_date: '2024-05-15', inspector_name: 'You' },
    { id: 102, ngo_name: 'Care India', status: 'completed', priority: 'medium', scheduled_date: '2024-05-10', inspector_name: 'You' },
  ]);
  const [activeInspection, setActiveInspection] = useState(null);
  const [location, setLocation] = useState(null);

  const handleStart = async (inspection) => {
    try {
      toast.loading('Verifying GPS Location...', { id: 'gps' });
      const coords = await getCurrentLocation();
      setLocation(coords);
      toast.success('Location verified! Proceeding with inspection.', { id: 'gps' });
      setActiveInspection(inspection);
    } catch (e) {
      toast.error('Failed to get GPS location. It is required to start inspection.', { id: 'gps' });
      // Proceeding anyway for demo purposes
      setLocation({ lat: 28.6139, lng: 77.2090 });
      setActiveInspection(inspection);
    }
  };

  const submitInspection = (e) => {
    e.preventDefault();
    toast.success('Inspection Report Submitted Successfully!');
    setInspections(inspections.map(i => i.id === activeInspection.id ? { ...i, status: 'completed' } : i));
    setActiveInspection(null);
  };

  if (activeInspection) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Field Inspection: {activeInspection.ngo_name}</h2>
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Fetching...'}</span>
              <span>ID: #{activeInspection.id}</span>
            </div>
          </div>
          <button onClick={() => setActiveInspection(null)} className="text-gray-500 hover:text-gray-800">Cancel</button>
        </div>

        <form onSubmit={submitInspection} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">1. Infrastructure & Facilities</h3>
            <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" required className="mt-1 rounded text-blue-600 focus:ring-blue-500" />
              <div>
                <span className="font-medium text-gray-800">Premises are clean and well-maintained</span>
                <input type="text" placeholder="Remarks..." className="mt-2 w-full text-sm p-2 border border-gray-300 rounded" />
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" required className="mt-1 rounded text-blue-600 focus:ring-blue-500" />
              <div>
                <span className="font-medium text-gray-800">CCTV cameras are functional and recording</span>
                <input type="text" placeholder="Remarks..." className="mt-2 w-full text-sm p-2 border border-gray-300 rounded" />
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">2. Documentation & Records</h3>
            <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" required className="mt-1 rounded text-blue-600 focus:ring-blue-500" />
              <div>
                <span className="font-medium text-gray-800">Beneficiary attendance register is updated</span>
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">3. Photographic Evidence</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to capture or upload photos</p>
              <input type="file" accept="image/*" multiple className="hidden" id="photo-upload" />
              <label htmlFor="photo-upload" className="mt-4 inline-block bg-white border border-gray-300 px-4 py-2 rounded text-sm font-medium cursor-pointer hover:bg-gray-50">Select Files</label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">4. Overall Findings</h3>
            <textarea required rows="4" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter detailed observation..."></textarea>
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Submit Final Report
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200">
        <button onClick={() => setActiveTab('my_assignments')} className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'my_assignments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>My Assignments</button>
        <button onClick={() => setActiveTab('ai_assign')} className={`px-6 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'ai_assign' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
          <BrainCircuit className="w-4 h-4" /> AI Smart Assign
        </button>
      </div>

      {activeTab === 'my_assignments' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inspections.map(ins => (
            <InspectionCard key={ins.id} inspection={ins} onStart={handleStart} onView={() => toast('View mode coming soon')} />
          ))}
        </div>
      ) : (
        <div className="bg-purple-50 rounded-xl p-8 border border-purple-100 text-center max-w-2xl mx-auto mt-10">
          <BrainCircuit className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Driven Risk Assignment</h2>
          <p className="text-gray-600 mb-6">Our system analyzes compliance scores, anomaly alerts, and time since last inspection to optimize inspector routing and target high-risk NGOs.</p>
          <button onClick={() => toast.success('AI Assignment Triggered! Assignments dispatched.')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-colors">
            Generate Optimized Schedule
          </button>
        </div>
      )}
    </div>
  );
};

export default InspectionModule;
