import React, { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Monitor, History, UserCheck, ShieldAlert, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const VideoConference = () => {
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTarget, setActiveTarget] = useState({
    name: 'Rahul Kumar (Beneficiary)',
    ngo: 'Delhi NGO - SMILE Scheme',
    phone: '+91 98765 43210',
  });

  const [logs, setLogs] = useState([
    { id: 1, date: '2026-08-28 14:30', target: 'Rahul Kumar (Beneficiary)', ngo: 'Delhi NGO', duration: '5m 20s', status: 'verified' },
    { id: 2, date: '2026-08-27 11:15', target: 'Meera Sharma (Staff)', ngo: 'Mumbai Support', duration: '12m 45s', status: 'verified' },
    { id: 3, date: '2026-08-26 16:40', target: 'Suresh Patel (Manager)', ngo: 'Chennai Aid', duration: '3m 10s', status: 'flagged' },
  ]);

  const handleInitiateCall = () => {
    setCallStatus('calling');
    const toastId = toast.loading('AI Selecting Random Beneficiary for Inspection VC...', { duration: 2500 });
    
    setTimeout(() => {
      setCallStatus('connected');
      toast.dismiss(toastId);
      toast.success('Random Video Inspection Connected Live!');
    }, 2500);
  };

  const handleEndCall = () => {
    setCallStatus('idle');
    toast('Call disconnected and audit logged.', { icon: '📞' });

    // Append to logs
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      target: activeTarget.name,
      ngo: activeTarget.ngo,
      duration: '1m 15s',
      status: 'verified'
    };
    setLogs([newLog, ...logs]);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Video Call Interface (2 Cols desktop) */}
      <div className="xl:col-span-2 space-y-6">
        {/* Header Action Banner */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              Random Surprise Video Inspection
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              AI randomly dials institute incharge, staff, or beneficiaries for real-time verification.
            </p>
          </div>

          <button
            onClick={handleInitiateCall}
            disabled={callStatus !== 'idle'}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-bold text-xs md:text-sm transition-all shadow-md shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            {callStatus === 'idle' ? 'Start Random Call' : callStatus === 'calling' ? 'Dialing Target...' : 'Call Active'}
          </button>
        </div>

        {/* Live Video Box */}
        <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video relative shadow-xl border border-slate-800">
          {callStatus === 'connected' ? (
            <>
              {/* Remote Stream Mock */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 flex flex-col items-center justify-center text-white p-4">
                <div className="w-20 h-20 rounded-full bg-blue-600/30 border-2 border-blue-400 flex items-center justify-center text-blue-300 font-extrabold text-2xl mb-3 shadow-lg">
                  {activeTarget.name.charAt(0)}
                </div>
                <h3 className="font-bold text-lg text-white">{activeTarget.name}</h3>
                <p className="text-xs text-emerald-400 font-mono mt-1">📍 {activeTarget.ngo}</p>
                <span className="mt-2 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  WebRTC Live Encrypted Session
                </span>
              </div>

              {/* Local PiP Feed */}
              <div className="absolute top-4 right-4 w-32 sm:w-44 aspect-video bg-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col items-center justify-center text-white p-2">
                {isVideoOff ? (
                  <span className="text-[10px] text-slate-400 font-bold">Camera Off</span>
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-blue-400 mb-1 animate-pulse" />
                    <span className="text-[10px] text-slate-300 font-mono">Inspector Feed</span>
                  </>
                )}
              </div>

              {/* Call Controls Bar */}
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-2.5 sm:p-3 rounded-full backdrop-blur-md shadow-2xl">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3 rounded-full transition-colors ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                  title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-lg shadow-rose-600/30 active:scale-95"
                  title="Disconnect Call"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>

              {/* Target info badge */}
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                👤 {activeTarget.name}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
              <Video className="w-16 h-16 text-slate-700 mb-3" />
              <p className="text-base font-bold text-slate-300">Surprise Video Verification Ready</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Click "Start Random Call" to trigger an unannounced video inspection with any registered project.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Call History & Audit Trail (1 Col desktop) */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 md:p-6 flex flex-col h-full">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-blue-600" />
          Inspection Call Audit Logs
        </h3>

        <div className="space-y-3 flex-1 overflow-y-auto max-h-[450px] pr-1">
          {logs.map((log) => (
            <div key={log.id} className="p-3.5 border border-slate-100 bg-slate-50/70 rounded-xl hover:border-blue-200 transition-colors">
              <div className="flex justify-between items-start mb-1.5">
                <span className="font-bold text-xs md:text-sm text-slate-800">{log.target}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {log.duration}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{log.ngo}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">{log.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoConference;
