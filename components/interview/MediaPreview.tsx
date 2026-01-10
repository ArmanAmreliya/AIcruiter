
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MediaPreviewProps {
  stream: MediaStream | null;
  isMuted: boolean;
  onToggleMute: () => void;
  error?: string | null;
}

export const MediaPreview = ({ stream, isMuted, onToggleMute, error }: MediaPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Audio analysis
  useEffect(() => {
    if (!stream || isMuted) {
      setAudioLevel(0);
      return;
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 32;
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      // Normalize to 0-100 range roughly
      const normalized = Math.min(100, (average / 128) * 100);
      setAudioLevel(normalized);

      rafRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [stream, isMuted]);

  if (error) {
    return (
      <div className="w-full h-full min-h-[300px] bg-black text-white rounded-[2rem] flex flex-col items-center justify-center p-6 text-center border border-black/10">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">Camera Access Denied</h3>
        <p className="text-white/60 max-w-xs">
          Please allow camera and microphone access in your browser settings to continue.
        </p>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="w-full h-full min-h-[300px] bg-black text-white rounded-[2rem] flex flex-col items-center justify-center border border-black/10">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
         <p className="text-sm font-medium opacity-60">Initializing devices...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-black/5">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform scale-x-[-1]"
      />
      
      {/* Audio Meter Overlay */}
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          {/* Visualizer Bars */}
          <div className="flex items-end gap-1 h-5">
             {[1, 2, 3, 4, 5].map((i) => (
                <motion.div 
                  key={i}
                  className="w-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  animate={{ 
                    height: isMuted ? 6 : Math.max(6, audioLevel * (0.3 + (i * 0.15))) 
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
             ))}
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider pl-2 border-l border-white/20 ml-1">
            {isMuted ? 'Muted' : 'Active'}
          </span>
        </div>

        <button 
          onClick={onToggleMute}
          className={cn(
            "p-3 rounded-full transition-all duration-200 border shadow-lg",
            isMuted 
              ? "bg-red-500 border-red-500 text-white hover:bg-red-600" 
              : "bg-white text-black border-white hover:bg-gray-100"
          )}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>
      
      {/* Status Indicators */}
      <div className="absolute top-6 right-6">
        <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
        </div>
      </div>
    </div>
  );
};
