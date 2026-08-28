import React, { useState } from 'react';
import { Fingerprint, Eye, ShieldCheck, CheckCircle2, RefreshCw, X, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const BiometricScannerModal = ({ isOpen, onClose, beneficiaryName = 'Anita Devi' }) => {
  const [scanMode, setScanMode] = useState('FINGERPRINT');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleStartScan = () => {
    setIsScanning(true);
    setResult(null);
    toast.loading(`Communicating with L1 RD Service (${scanMode})...`, { id: 'rd_scan' });

    setTimeout(() => {
      setIsScanning(false);
      const matchScore = (95.2 + Math.random() * 4).toFixed(1);
      const resData = {
        verificationId: `bio_${Date.now()}`,
        aadhaarRef: 'XXXX-XXXX-8921',
        mode: scanMode,
        rdDeviceId: 'MANTRA_MFS100_RD_V2',
        matchScore: `${matchScore}%`,
        status: 'VERIFIED_MATCH',
        name: beneficiaryName,
        timestamp: new Date().toLocaleTimeString(),
      };
      setResult(resData);
      toast.success(`Aadhaar ${scanMode} Match Verified! Score: ${matchScore}%`, { id: 'rd_scan' });
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-6 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            {scanMode === 'FINGERPRINT' ? <Fingerprint className="w-8 h-8" /> : <Eye className="w-8 h-8" />}
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 uppercase tracking-widest">
            Aadhaar UIDAI RD Service
          </span>
          <h3 className="text-lg font-black text-slate-900">Biometric Presence Audit</h3>
          <p className="text-xs text-slate-500">
            Scanning biometric data for <strong>{beneficiaryName}</strong> via handheld L1 RD scanner.
          </p>
        </div>

        {/* Scanner Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => { setScanMode('FINGERPRINT'); setResult(null); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              scanMode === 'FINGERPRINT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5 text-amber-600" /> Fingerprint Scan
          </button>
          <button
            onClick={() => { setScanMode('IRIS'); setResult(null); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              scanMode === 'IRIS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" /> Iris Retinal Scan
          </button>
        </div>

        {/* Scanner Viewfinder Box */}
        <div className="bg-slate-950 rounded-2xl p-6 text-center text-white relative overflow-hidden border border-slate-800 flex flex-col items-center justify-center min-h-[160px]">
          {isScanning ? (
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-amber-300 animate-pulse">Communicating with UIDAI Vault...</p>
            </div>
          ) : result ? (
            <div className="space-y-2 animate-in zoom-in-90">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-black text-sm text-emerald-400">AADHAAR BIOMETRIC MATCH VERIFIED</h4>
              <p className="text-xs font-mono text-slate-300">Match Score: <strong>{result.matchScore}</strong></p>
              <p className="text-[10px] text-slate-400">Aadhaar Ref: {result.aadhaarRef} • RD Device: {result.rdDeviceId}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400">Place beneficiary thumb/eye on connected L1 RD scanner</p>
              <button
                onClick={handleStartScan}
                className="mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
              >
                Capture {scanMode} Scan
              </button>
            </div>
          )}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-900"
          >
            Close Biometric Interface
          </button>
        </div>
      </div>
    </div>
  );
};

export default BiometricScannerModal;
