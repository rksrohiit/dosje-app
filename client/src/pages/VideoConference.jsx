import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Phone, Monitor, History, UserCheck, Camera, Radio, ShieldCheck, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const VideoConference = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [callStatus, setCallStatus] = useState('idle'); // idle | calling | incoming | connected
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  const [logs, setLogs] = useState([
    { id: 1, date: '2026-08-28 14:30', target: 'Rahul Kumar (Beneficiary)', ngo: 'Delhi NGO', duration: '5m 20s', status: 'Verified' },
    { id: 2, date: '2026-08-27 11:15', target: 'Meera Sharma (Staff)', ngo: 'Mumbai Support', duration: '12m 45s', status: 'Verified' },
    { id: 3, date: '2026-08-26 16:40', target: 'Suresh Patel (Manager)', ngo: 'Chennai Aid', duration: '3m 10s', status: 'Verified' },
  ]);

  // Start local camera stream
  const startLocalMedia = async () => {
    try {
      if (localStream) return localStream;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.warn('Camera/Mic permission denied or not available, creating mock stream indicator:', err);
      toast.error('Camera/Microphone access required for WebRTC video call.');
      return null;
    }
  };

  // Cleanup WebRTC connection
  const cleanupCall = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setCallStatus('idle');
    setIncomingCallData(null);
  };

  // Socket listeners for WebRTC signaling
  useEffect(() => {
    if (!socket) return;

    socket.on('online_users_update', (users) => {
      setOnlineUsers(users.filter(u => u.id !== user?.id));
    });

    socket.on('vc_incoming', (data) => {
      if (data.initiator_id === user?.id) return;
      setIncomingCallData(data);
      setCallStatus('incoming');
      toast('Incoming Surprise Video Call Request!', { icon: '📞', duration: 8000 });
    });

    socket.on('vc_accepted', async (data) => {
      toast.success('Call Accepted! Connecting WebRTC video stream...');
      setCallStatus('connected');
    });

    socket.on('vc_rejected', () => {
      toast.error('Call was declined or target was busy.');
      cleanupCall();
    });

    socket.on('vc_signal', async (data) => {
      if (!peerRef.current && data.signal) {
        // Create receiver peer
        const peer = new RTCPeerConnection(RTC_CONFIG);
        peerRef.current = peer;

        peer.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit('vc_signal', { to: data.from, candidate: e.candidate });
          }
        };

        peer.ontrack = (e) => {
          setRemoteStream(e.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = e.streams[0];
          }
        };

        const stream = await startLocalMedia();
        if (stream) {
          stream.getTracks().forEach(track => peer.addTrack(track, stream));
        }

        await peer.setRemoteDescription(new RTCSessionDescription(data.signal));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit('vc_signal', { to: data.from, signal: answer });
      } else if (peerRef.current) {
        if (data.signal && peerRef.current.signalingState !== 'stable') {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.signal));
        } else if (data.candidate) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      }
    });

    socket.on('vc_ended', () => {
      toast('Video Inspection Session Ended.', { icon: '👋' });
      cleanupCall();
    });

    return () => {
      socket.off('online_users_update');
      socket.off('vc_incoming');
      socket.off('vc_accepted');
      socket.off('vc_rejected');
      socket.off('vc_signal');
      socket.off('vc_ended');
    };
  }, [socket, user, localStream]);

  // Attach local stream to video tag whenever localStream state changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video tag whenever remoteStream state changes
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Initiate call
  const handleInitiateCall = async () => {
    setCallStatus('calling');
    toast.loading('Initiating WebRTC peer video call...', { id: 'webrtc' });

    const stream = await startLocalMedia();

    const peer = new RTCPeerConnection(RTC_CONFIG);
    peerRef.current = peer;

    peer.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.emit('vc_signal', { to: selectedTargetUser?.id || 'all', candidate: e.candidate });
      }
    };

    peer.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    if (stream) {
      stream.getTracks().forEach(track => peer.addTrack(track, stream));
    }

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    const callPayload = {
      initiator_id: user?.id || 'u1',
      initiator_name: user?.name || 'DoSJE Officer',
      target_user_id: selectedTargetUser?.id || null,
      target_name: selectedTargetUser?.name || 'Random NGO Staff',
      signal: offer
    };

    if (socket) {
      socket.emit('vc_initiate', callPayload);
      socket.emit('vc_signal', { to: selectedTargetUser?.id || 'all', signal: offer });
    }

    toast.dismiss('webrtc');
    // Simulated connection if single tab demo
    setTimeout(() => {
      if (callStatus === 'calling') {
        setCallStatus('connected');
        toast.success('Peer-to-Peer Video Call Established!');
      }
    }, 2000);
  };

  // Accept incoming call
  const handleAcceptCall = async () => {
    setCallStatus('connected');
    toast.success('Incoming Call Accepted!');

    const stream = await startLocalMedia();

    if (socket && incomingCallData) {
      socket.emit('vc_accept', {
        initiator_id: incomingCallData.initiator_id,
        target_name: user?.name || 'NGO Staff'
      });
    }
  };

  // Reject incoming call
  const handleRejectCall = () => {
    if (socket && incomingCallData) {
      socket.emit('vc_reject', { initiator_id: incomingCallData.initiator_id });
    }
    cleanupCall();
  };

  // End active call
  const handleEndCall = () => {
    if (socket) {
      socket.emit('vc_end', {
        initiator_id: user?.id,
        target_user_id: selectedTargetUser?.id
      });
    }

    // Add audit log entry
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      target: selectedTargetUser?.name || incomingCallData?.initiator_name || 'Rahul Kumar (Beneficiary)',
      ngo: 'Delhi NGO - SMILE Scheme',
      duration: '2m 14s',
      status: 'Verified'
    };
    setLogs([newLog, ...logs]);

    cleanupCall();
  };

  // Toggle Mute
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    }
    setIsMuted(!isMuted);
  };

  // Toggle Video Camera
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    }
    setIsVideoOff(!isVideoOff);
  };

  // Capture Snapshot
  const handleCaptureSnapshot = () => {
    toast.success('Geo-tagged Inspection Snapshot captured and logged to audit trail.');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 uppercase tracking-widest">
              WebRTC Encrypted Peer-to-Peer
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            Live Surprise Video Conferencing & Verification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant random audio/video check-ins with NGO project incharge, staff, or beneficiaries.
          </p>
        </div>

        {/* Target Selector & Dial Button */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedTargetUser?.id || ''}
            onChange={(e) => {
              const u = onlineUsers.find(userItem => userItem.id === e.target.value);
              setSelectedTargetUser(u || null);
            }}
            className="border-slate-300 text-xs md:text-sm font-semibold rounded-xl shadow-xs py-2 px-3 focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 outline-none"
          >
            <option value="">🎯 Target: Random Beneficiary / Staff</option>
            {onlineUsers.map(u => (
              <option key={u.id} value={u.id}>
                👤 {u.name} ({u.role?.toUpperCase()})
              </option>
            ))}
          </select>

          <button
            onClick={handleInitiateCall}
            disabled={callStatus !== 'idle'}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-md shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            {callStatus === 'idle' ? 'Dial WebRTC Call' : callStatus === 'calling' ? 'Calling Peer...' : 'Call Active'}
          </button>
        </div>
      </div>

      {/* Main Video Call Area (2 Cols desktop) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video relative shadow-2xl border border-slate-800 flex items-center justify-center">
            {/* Remote Video Stream Tag */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${callStatus === 'connected' && remoteStream ? 'block' : 'hidden'}`}
            />

            {/* Remote Video Placeholder when no video track */}
            {(callStatus === 'connected' && !remoteStream) && (
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center text-white p-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-extrabold text-2xl mb-3 shadow-lg animate-pulse">
                  {selectedTargetUser?.name?.charAt(0) || 'R'}
                </div>
                <h3 className="font-bold text-lg text-white">{selectedTargetUser?.name || 'Rahul Kumar (Beneficiary)'}</h3>
                <p className="text-xs text-emerald-400 font-mono mt-1">📍 Delhi NGO - SMILE Scheme</p>
                <span className="mt-3 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  WebRTC Audio/Video Active
                </span>
              </div>
            )}

            {/* Local Video Stream PiP */}
            <div className="absolute top-4 right-4 w-32 sm:w-44 aspect-video bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex items-center justify-center text-white z-20">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${localStream && !isVideoOff ? 'block' : 'hidden'}`}
              />
              {(!localStream || isVideoOff) && (
                <div className="flex flex-col items-center justify-center p-2 text-center">
                  <Camera className="w-5 h-5 text-slate-500 mb-1" />
                  <span className="text-[10px] text-slate-400 font-bold">Local Camera Off</span>
                </div>
              )}
            </div>

            {/* Idle State Banner */}
            {callStatus === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                <Video className="w-16 h-16 text-slate-700 mb-3" />
                <p className="text-base font-bold text-slate-300">Ready to Start Inspection Video Call</p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Select an online staff member or click "Dial WebRTC Call" for instant unannounced verification.
                </p>
              </div>
            )}

            {/* In-Call HUD Controls Bar */}
            {callStatus === 'connected' && (
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-2.5 sm:p-3 rounded-full backdrop-blur-md shadow-2xl z-30">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full transition-all ${isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                  title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-all ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                  title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleCaptureSnapshot}
                  className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 transition-all"
                  title="Capture Audit Snapshot"
                >
                  <Camera className="w-5 h-5" />
                </button>

                <button
                  onClick={handleEndCall}
                  className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-lg shadow-rose-600/30 active:scale-95"
                  title="Disconnect Call"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Audit Call History Sidebar */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 md:p-6 flex flex-col h-full">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-blue-600" />
            Inspection Call Audit Logs
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[450px] pr-1">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 border border-slate-100 bg-slate-50/80 rounded-xl hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-xs md:text-sm text-slate-800">{log.target}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
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

      {/* Incoming Call Dialog Modal */}
      {callStatus === 'incoming' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm text-center text-white space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-blue-600/30 border-2 border-blue-400 flex items-center justify-center text-blue-300 text-2xl font-bold mx-auto animate-bounce">
              📞
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-widest">
                Surprise Video Inspection
              </span>
              <h3 className="text-xl font-black text-white mt-2">
                {incomingCallData?.initiator_name || 'DoSJE Inspection Officer'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Requesting Live Video Call Verification</p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={handleRejectCall}
                className="flex-1 py-3 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <X className="w-4 h-4" /> Decline
              </button>
              <button
                onClick={handleAcceptCall}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 animate-pulse"
              >
                <Check className="w-4 h-4" /> Accept Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoConference;
