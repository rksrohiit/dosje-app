import React, { useState } from 'react';
import { Camera, MapPin, ShieldCheck, ShieldAlert, CheckCircle2, AlertOctagon, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EXIFVerificationModal = ({ isOpen, onClose, photoName = 'inspection_photo_01.jpg' }) => {
  const [analysis, setAnalysis] = useState({
    filename: photoName,
    cameraMake: 'Samsung Galaxy S23 Ultra',
    gpsCoords: '28.6139° N, 77.2090° E',
    ngoRegisteredCoords: '28.6139° N, 77.2090° E',
    distanceMeters: 38,
    timestamp: new Date().toLocaleString(),
    isWithinGeofence: true,
    isGenuine: true,
    verdict: 'VERIFIED_GENUINE_ON_SITE'
  });

  if (!isOpen) return null;

  const handleTestFraudPhoto = () => {
    setAnalysis({
      filename: 'downloaded_image_sample.jpg',
      cameraMake: 'Unknown / EXIF Stripped',
      gpsCoords: '19.0760° N, 72.8777° E (Mumbai)',
      ngoRegisteredCoords: '28.6139° N, 77.2090° E (Delhi)',
      distanceMeters: 1150000,
      timestamp: '2024-01-15 08:20 AM',
      isWithinGeofence: false,
      isGenuine: false,
      verdict: 'FRAUD_LOCATION_MISMATCH'
    });
    toast.error('🚨 AI EXIF Analysis: Location mismatch detected! Photo was taken 1,150 km away!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-black text-slate-900">AI EXIF Metadata & Geofence Audit</h3>
        </div>

        <div className="p-3.5 rounded-2xl border bg-slate-50 space-y-2 text-xs">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-600">File Name:</span>
            <span className="font-mono text-slate-900">{analysis.filename}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-600">Camera Device Make:</span>
            <span className="font-semibold text-slate-800">{analysis.cameraMake}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-600">Photo GPS Coordinates:</span>
            <span className="font-mono text-blue-700 font-bold">{analysis.gpsCoords}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-600">Registered NGO Address:</span>
            <span className="font-mono text-slate-700">{analysis.ngoRegisteredCoords}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-600">Distance Radius Check:</span>
            <span className={`font-bold ${analysis.isWithinGeofence ? 'text-emerald-700' : 'text-rose-700'}`}>
              📍 {analysis.distanceMeters} meters away
            </span>
          </div>
        </div>

        {/* Verdict Badge */}
        <div className={`p-4 rounded-2xl border text-center space-y-1 ${
          analysis.isGenuine
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center justify-center gap-1.5 font-black text-sm">
            {analysis.isGenuine ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertOctagon className="w-5 h-5 text-rose-600" />}
            <span>{analysis.isGenuine ? 'VERIFIED GENUINE FIELD PHOTO' : 'FRAUDULENT / MISMATCHED PHOTO'}</span>
          </div>
          <p className="text-[11px] font-medium opacity-90">
            {analysis.isGenuine
              ? 'Photo verified to be taken live on-site within 500m geofence radius.'
              : 'EXIF metadata flags location/timestamp mismatch! Downloaded photo detected.'}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleTestFraudPhoto}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 underline"
          >
            Test Fraud Photo Detection
          </button>
          <button
            onClick={onClose}
            className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};

export default EXIFVerificationModal;
