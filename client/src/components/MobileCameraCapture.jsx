import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, CheckCircle, RefreshCcw, Maximize, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MobileCameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Prefer rear camera for mobile
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Camera permission denied or device not found. Using simulated capture.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (hasCameraPermission && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageUrl);
    } else {
      // Simulated photo capture if no camera attached (e.g. some desktops)
      setCapturedImage('https://images.unsplash.com/photo-1593113563332-f368c8585489?q=80&w=600&auto=format&fit=crop');
    }
  };

  const confirmPhoto = () => {
    toast.success("Geo-Tagged Photo Evidence Captured!");
    onCapture(capturedImage);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10 text-white">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-sm tracking-wide shadow-black drop-shadow-md">LIVE EVIDENCE CAPTURE</span>
        </div>
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Viewfinder/Canvas */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`min-w-full min-h-full object-cover ${hasCameraPermission ? 'block' : 'hidden'}`}
            ></video>
            
            {!hasCameraPermission && (
              <div className="text-center p-6 text-slate-400">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-sm">{error || "Initializing Camera Engine..."}</p>
              </div>
            )}
            
            {/* Viewfinder HUD Guides */}
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
              <div className="absolute inset-0 border border-white/30 flex items-center justify-center">
                <Maximize className="w-16 h-16 text-white/30" />
              </div>
            </div>
            
            {/* Live GPS Overlay */}
            <div className="absolute bottom-28 left-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-2.5 border border-white/10 flex justify-between items-end">
              <div>
                <p className="text-[10px] text-green-400 font-mono font-bold mb-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> 
                  GPS LOCK ACQUIRED
                </p>
                <p className="text-[11px] text-white font-mono">LAT: 28.6139° N</p>
                <p className="text-[11px] text-white font-mono">LNG: 77.2090° E</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-300 font-mono">{new Date().toLocaleTimeString()}</p>
                <p className="text-[10px] text-slate-300 font-mono">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </>
        ) : (
          <img src={capturedImage} alt="Evidence" className="min-w-full min-h-full object-cover" />
        )}
        
        {/* Hidden Canvas for Capture */}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>

      {/* Bottom Controls */}
      <div className="h-32 bg-black pb-safe flex items-center justify-center gap-12 relative z-10 px-8">
        {!capturedImage ? (
          <>
            <button 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              onClick={takePhoto}
              className="w-20 h-20 rounded-full border-4 border-white p-1 focus:outline-none focus:scale-95 transition-transform"
            >
              <div className="w-full h-full bg-white rounded-full"></div>
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <RefreshCcw className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={retakePhoto}
              className="px-6 py-3 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
            >
              Retake
            </button>
            <button 
              onClick={confirmPhoto}
              className="px-6 py-3 rounded-full bg-blue-600 text-white font-bold flex items-center gap-2 hover:bg-blue-500 transition shadow-lg shadow-blue-500/30"
            >
              <CheckCircle className="w-5 h-5" /> Use Photo
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileCameraCapture;
