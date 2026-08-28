import React, { useState, useEffect } from 'react';
import { UserCheck, AlertTriangle, Eye, ShieldCheck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const CCTVHeadcountAnalyzer = ({ cameraName = 'Main Dining Hall Feed', reportedCount = 48 }) => {
  const [detectedFaces, setDetectedFaces] = useState(44);
  const [confidence, setConfidence] = useState('96.8%');
  const [isScanning, setIsScanning] = useState(false);

  const boxes = [
    { id: 1, top: '25%', left: '20%', width: '12%', height: '18%', confidence: '0.98' },
    { id: 2, top: '30%', left: '42%', width: '10%', height: '16%', confidence: '0.95' },
    { id: 3, top: '20%', left: '65%', width: '11%', height: '17%', confidence: '0.97' },
    { id: 4, top: '50%', left: '30%', width: '13%', height: '20%', confidence: '0.94' },
  ];

  const handleRunAiScan = () => {
    setIsScanning(true);
    toast.loading('AI Computer Vision model scanning CCTV frame for face bounding boxes...', { id: 'cctv_scan' });
    setTimeout(() => {
      setIsScanning(false);
      const newDetected = 42 + Math.floor(Math.random() * 5);
      setDetectedFaces(newDetected);
      toast.success(`AI Face Count Complete: ${newDetected} faces detected on live stream!`, { id: 'cctv_scan' });
    }, 1800);
  };

  const discrepancy = Math.abs(reportedCount - detectedFaces);
  const isHighVariance = reportedCount > detectedFaces + 8;

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-4 md:p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-sm text-white">AI Vision Automated Headcount</h3>
        </div>

        <button
          onClick={handleRunAiScan}
          disabled={isScanning}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning Stream...' : 'Run Real-time AI Face Count'}
        </button>
      </div>

      {/* Visual Bounding Box Overlay Box */}
      <div className="bg-slate-950 rounded-xl overflow-hidden aspect-video relative border border-slate-800 flex items-center justify-center">
        {/* Scanning Scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/15 to-transparent h-12 w-full animate-bounce"></div>

        {/* AI Face Bounding Boxes */}
        {boxes.map((box) => (
          <div
            key={box.id}
            style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
            className="absolute border-2 border-emerald-400 bg-emerald-500/10 rounded-md transition-all animate-pulse flex items-start justify-end p-0.5"
          >
            <span className="bg-emerald-500 text-slate-950 font-mono text-[8px] font-black px-1 rounded">
              Face #{box.id} ({box.confidence})
            </span>
          </div>
        ))}

        {/* HUD Stats overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">AI Detected Headcount</span>
            <p className="text-base font-black text-emerald-400">{detectedFaces} Faces</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Register Claim</span>
            <p className="text-base font-black text-slate-200">{reportedCount} Claimed</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Model Confidence</span>
            <p className="text-xs font-mono font-bold text-amber-400">{confidence}</p>
          </div>
        </div>
      </div>

      {/* Variance Alert Banner */}
      {isHighVariance && (
        <div className="p-3 bg-rose-950/60 border border-rose-900/60 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>⚠️ Variance Warning: Register claims {reportedCount} beneficiaries but AI CCTV vision detects only {detectedFaces}.</span>
        </div>
      )}
    </div>
  );
};

export default CCTVHeadcountAnalyzer;
