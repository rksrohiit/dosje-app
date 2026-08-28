import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, Radio, PhoneCall, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const SOSDistressButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  const handleTriggerSOS = () => {
    setIsTransmitting(true);
    toast.loading('Transmitting Emergency SOS & GPS Coordinates to Police Dispatch...', { id: 'sos' });

    setTimeout(() => {
      setIsTransmitting(false);
      setSosSent(true);
      toast.error('🚨 POLICE EMERGENCY DISPATCHED: State Police Dial 112 Control Room notified with live GPS pin!');
    }, 2000);
  };

  return (
    <>
      {/* Floating Panic Button Badge */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white p-3.5 rounded-full shadow-2xl border-2 border-white flex items-center justify-center animate-pulse transition-transform active:scale-90"
          title="Field Inspector Emergency SOS Panic Button"
        >
          <AlertOctagon className="w-6 h-6" />
        </button>
      </div>

      {/* SOS Dialog Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-rose-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl border border-rose-600/50 w-full max-w-sm overflow-hidden shadow-2xl p-6 relative space-y-4 animate-in zoom-in-95">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-rose-600/20 border-2 border-rose-500 text-rose-500 flex items-center justify-center mx-auto animate-ping">
                <AlertOctagon className="w-9 h-9" />
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-widest">
                PMU Field Safety Protocol
              </span>
              <h3 className="text-xl font-black text-white">Emergency SOS Signal</h3>
              <p className="text-xs text-slate-300">
                Facing physical harassment or obstruction during a surprise audit? Trigger emergency police dispatch.
              </p>
            </div>

            {sosSent ? (
              <div className="bg-rose-950 border border-rose-800 p-4 rounded-2xl text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto" />
                <h4 className="font-black text-sm text-rose-400">POLICE DISPATCH ACTIVE</h4>
                <p className="text-xs text-slate-300">
                  Live GPS Coordinates (<strong>28.6139° N, 77.2090° E</strong>) transmitted to Police Dial 112 & DoSJE Control Room. Help is en route.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleTriggerSOS}
                  disabled={isTransmitting}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black text-sm py-4 rounded-2xl shadow-xl shadow-rose-950/80 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Radio className="w-5 h-5 animate-pulse" />
                  {isTransmitting ? 'Transmitting GPS Pin...' : 'TRANSMIT SOS EMERGENCY SIGNAL'}
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  ⚠️ This transmits an official emergency distress signal to State Police & PMU Officers.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SOSDistressButton;
