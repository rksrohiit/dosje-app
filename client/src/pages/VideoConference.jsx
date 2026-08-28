import React, { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Monitor, History } from 'lucide-react';
import toast from 'react-hot-toast';

const VideoConference = () => {
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleInitiateCall = () => {
    setCallStatus('calling');
    toast.loading('Contacting random NGO beneficiary...', { duration: 2000 });
    setTimeout(() => {
      setCallStatus('connected');
      toast.success('Call connected!');
    }, 2500);
  };

  const handleEndCall = () => {
    setCallStatus('idle');
    toast('Call ended', { icon: '👋' });
  };

  const logs = [
    { date: '2024-05-10 14:30', target: 'Rahul K. (Beneficiary)', ngo: 'Hope Foundation', duration: '5m 20s' },
    { date: '2024-05-09 11:15', target: 'Meera S. (Staff)', ngo: 'Care India', duration: '12m 45s' },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Video className="text-blue-600" /> Random Verification Call
            </h2>
            <p className="text-sm text-gray-500 mt-1">Surprise video checks with NGO staff or beneficiaries.</p>
          </div>
          <button 
            onClick={handleInitiateCall}
            disabled={callStatus !== 'idle'}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
          >
            {callStatus === 'idle' ? 'Initiate Random Call' : callStatus === 'calling' ? 'Calling...' : 'In Call'}
          </button>
        </div>

        <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video relative shadow-xl">
          {callStatus === 'connected' ? (
            <>
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-white">
                <span className="opacity-50">Remote Video Feed (Simulated)</span>
              </div>
              {/* Local Video Pip */}
              <div className="absolute bottom-4 right-4 w-48 aspect-video bg-gray-700 rounded-lg border-2 border-white/20 shadow-lg flex items-center justify-center text-xs text-white">
                {isVideoOff ? 'Camera Off' : 'Local Camera'}
              </div>
              
              {/* Controls */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 p-3 rounded-full backdrop-blur-sm">
                <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'} text-white transition`}>
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'} text-white transition`}>
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
                <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition">
                  <Monitor className="w-5 h-5" />
                </button>
                <button onClick={handleEndCall} className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition shadow-lg shadow-red-600/20">
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>
              
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                Target: Rahul K. (Hope Foundation)
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
              <Video className="w-16 h-16 mb-4 opacity-20" />
              <p>Ready to initiate verification call</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-gray-400" /> Call Logs
        </h3>
        <div className="flex-1 space-y-4">
          {logs.map((log, i) => (
            <div key={i} className="p-4 border border-gray-100 bg-gray-50 rounded-lg hover:border-blue-200 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-sm text-gray-800">{log.target}</span>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{log.duration}</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">{log.ngo}</p>
              <p className="text-xs text-gray-400">{log.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoConference;
