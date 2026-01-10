
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, Settings, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MediaPreview } from '../interview/MediaPreview';

interface InterviewPageProps {
  jobId?: string;
  onEndInterview: () => void;
}

type InterviewState = 'LOBBY' | 'ACTIVE' | 'ENDED';

export const InterviewPage = ({ jobId = "job_123", onEndInterview }: InterviewPageProps) => {
  const [state, setState] = useState<InterviewState>('LOBBY');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simulated AI Speaking state
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // Initialize Devices
  useEffect(() => {
    const initDevices = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(mediaStream);
        setError(null);
      } catch (err) {
        console.warn("Error accessing media devices, falling back to simulation:", err);
        // Fallback to simulated stream for demo
        const fakeStream = createDummyStream();
        setStream(fakeStream);
        // Don't set error, allowing user to proceed in demo mode
      }
    };

    initDevices();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Helper to create a dummy stream for demo purposes
  const createDummyStream = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    // Animation loop
    const draw = () => {
      if (!ctx) return;
      ctx.fillStyle = '#18181b'; // zinc-900
      ctx.fillRect(0, 0, 640, 480);
      
      const time = Date.now() / 2000;
      const x = 320 + Math.sin(time) * 50;
      const y = 240 + Math.cos(time * 1.5) * 30;

      // Pulse effect
      const gradient = ctx.createRadialGradient(x, y, 10, x, y, 120);
      gradient.addColorStop(0, 'rgba(124, 58, 237, 0.4)'); // Purple
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 120, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Demo Mode', 320, 230);
      
      ctx.fillStyle = '#a1a1aa'; // zinc-400
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText('Camera Simulated', 320, 260);

      requestAnimationFrame(draw);
    };
    draw();

    // Create dummy audio track
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dest = audioCtx.createMediaStreamDestination();
    // Leave it silent

    const videoTrack = canvas.captureStream(30).getVideoTracks()[0];
    const audioTrack = dest.stream.getAudioTracks()[0];
    
    return new MediaStream([videoTrack, audioTrack]);
  };

  // Simulate AI Speaking patterns when active
  useEffect(() => {
    if (state !== 'ACTIVE') return;
    
    // Simple simulation of turn-taking
    const interval = setInterval(() => {
      setIsAISpeaking(prev => !prev);
    }, 4000);

    return () => clearInterval(interval);
  }, [state]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      // Toggle logic for the UI state
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
         setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const startInterview = () => {
    setState('ACTIVE');
  };

  // --- Render: LOBBY STATE (Pure White) ---
  if (state === 'LOBBY') {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-4 lg:p-8 font-sans">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="order-2 lg:order-1 flex flex-col justify-center"
          >
            <div className="mb-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider mb-6">
                 <Sparkles size={12} />
                 <span>AiCruiter Interface</span>
               </div>
               <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-6 leading-[0.9]">
                 Ready for your <br/> interview?
               </h1>
               <p className="text-xl text-black/60 leading-relaxed max-w-md">
                 We'll start with a quick technical screening. The AI will ask you questions based on the job description.
               </p>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-6 group">
                 <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center font-bold text-lg group-hover:bg-black group-hover:text-white transition-colors">1</div>
                 <div>
                   <h4 className="font-bold text-lg">System Check</h4>
                   <p className="text-black/50">Camera and audio verified.</p>
                 </div>
              </div>
              <div className="w-px h-8 bg-black/10 ml-6"></div>
              <div className="flex items-center gap-6 opacity-40">
                 <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center font-bold text-lg">2</div>
                 <div>
                   <h4 className="font-bold text-lg">Interview</h4>
                   <p className="text-black/50">~15 Minutes duration</p>
                 </div>
              </div>
            </div>

            <button 
              onClick={startInterview}
              disabled={!!error && !stream} // Only disable if error AND no stream (fallback stream allows progress)
              className="w-full sm:w-auto px-10 h-16 bg-black text-white rounded-full text-lg font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              Start Interview
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            </button>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="order-1 lg:order-2"
          >
            <MediaPreview 
              stream={stream} 
              isMuted={isMuted} 
              onToggleMute={toggleMute} 
              error={error} 
            />
            <div className="mt-8 flex justify-center gap-8 text-xs font-bold uppercase tracking-widest text-black/40">
               <span>Secure Connection</span>
               <span>•</span>
               <span>Private Session</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- Render: ACTIVE INTERVIEW STATE (Pure Black) ---
  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-24 px-8 flex items-center justify-between z-50">
         <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">Recording</span>
              <span className="text-sm font-bold text-white">00:14</span>
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
               <Settings size={18} className="text-white/60" />
            </button>
            <button 
              onClick={onEndInterview}
              className="px-6 py-2.5 rounded-full border border-red-500/30 text-red-500 text-sm font-bold hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <PhoneOff size={16} />
              End Session
            </button>
         </div>
      </header>

      {/* Main Visualizer - AI Agent */}
      <main className="flex-1 flex flex-col items-center justify-center relative">
         {/* Central AI Entity */}
         <div className="relative w-96 h-96 flex items-center justify-center">
            {/* Outer Rings */}
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                animate={{ 
                  scale: isAISpeaking ? [1, 1.2 + (i * 0.1), 1] : 1,
                  opacity: isAISpeaking ? [0.1, 0.3 - (i * 0.05), 0.1] : 0.05
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                className="absolute inset-0 rounded-full border border-[#6D28D9]"
              />
            ))}
            
            {/* Core Glow */}
            <motion.div 
               animate={{ 
                 boxShadow: isAISpeaking 
                   ? "0 0 100px 20px rgba(109, 40, 217, 0.4)" 
                   : "0 0 50px 10px rgba(109, 40, 217, 0.1)"
               }}
               className="relative z-10 w-40 h-40 rounded-full bg-black border border-[#6D28D9] flex items-center justify-center overflow-hidden"
            >
               {/* Inner Activity */}
               <motion.div 
                 animate={{ scale: isAISpeaking ? [0.8, 1, 0.8] : 0.8 }}
                 transition={{ duration: 1.5, repeat: Infinity }}
                 className="w-full h-full bg-gradient-to-tr from-[#6D28D9] to-black opacity-50 blur-xl"
               />
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            </motion.div>
         </div>

         {/* Subtitles / Status */}
         <div className="mt-16 text-center max-w-2xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={isAISpeaking ? 'speaking' : 'listening'}
              className="flex flex-col items-center gap-4"
            >
               <span className="text-[#6D28D9] text-xs font-bold tracking-widest uppercase">
                 {isAISpeaking ? "AiCruiter Speaking" : "Listening..."}
               </span>
               <h3 className="text-3xl font-light text-white leading-relaxed">
                 "Can you describe a challenging technical problem you solved recently?"
               </h3>
            </motion.div>
         </div>
      </main>

      {/* User Self-View (Floating Bottom Right) */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        drag
        dragMomentum={false}
        className="absolute bottom-8 right-8 w-72 aspect-[4/3] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group cursor-move"
      >
        <video
          ref={(ref) => {
            if (ref && stream) ref.srcObject = stream;
          }}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform scale-x-[-1] opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute top-4 right-4">
           <div className={cn("w-3 h-3 rounded-full border-2 border-black", isMuted ? "bg-red-500" : "bg-green-500")} />
        </div>
      </motion.div>
    </div>
  );
};
