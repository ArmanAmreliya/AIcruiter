import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, Settings, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MediaPreview } from './MediaPreview';
import { useNavigate } from 'react-router-dom';

interface InterviewPageProps {
  jobId?: string;
  onEndInterview?: () => void; // Made optional for flexibility
}

type InterviewState = 'LOBBY' | 'ACTIVE' | 'ENDED';

export const InterviewPage = ({ jobId = "job_123", onEndInterview }: InterviewPageProps) => {
  const navigate = useNavigate(); // Add Router navigation
  const [state, setState] = useState<InterviewState>('LOBBY');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI State
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Timer State
  const [elapsedTime, setElapsedTime] = useState(0);

  const QUESTIONS = [
    "Welcome. Can you describe a challenging technical problem you solved recently?",
    "That sounds complex. How did you handle the trade-offs between performance and code readability?",
    "Interesting. Lastly, why do you want to join our team specifically?"
  ];

  // 1. Initialize Devices
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
        const fakeStream = createDummyStream();
        setStream(fakeStream);
      }
    };
    initDevices();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      window.speechSynthesis.cancel(); // Stop talking if unmounted
    };
  }, []);

  // 2. Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'ACTIVE') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. AI Interaction Logic (The "Brain")
  useEffect(() => {
    if (state !== 'ACTIVE') return;

    let timeout: NodeJS.Timeout;

    const speakNextQuestion = () => {
      if (currentQuestion >= QUESTIONS.length) return;

      const text = QUESTIONS[currentQuestion];
      const utterance = new SpeechSynthesisUtterance(text);

      // Configure Voice
      utterance.rate = 1;
      utterance.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      // Try to find a good English voice
      utterance.voice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) || voices[0];

      // Visual Sync
      utterance.onstart = () => setIsAISpeaking(true);
      utterance.onend = () => {
        setIsAISpeaking(false);
        // Wait 5 seconds (simulating user answer) then ask next
        timeout = setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
        }, 5000);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Small delay before first question
    const startDelay = setTimeout(() => {
      speakNextQuestion();
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(startDelay);
      window.speechSynthesis.cancel();
    };
  }, [state, currentQuestion]);

  // --- Helpers ---
  const createDummyStream = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new MediaStream();

    const draw = () => {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, 640, 480);
      const time = Date.now() / 2000;
      const x = 320 + Math.sin(time) * 50;
      const y = 240 + Math.cos(time * 1.5) * 30;
      const gradient = ctx.createRadialGradient(x, y, 10, x, y, 120);
      gradient.addColorStop(0, 'rgba(124, 58, 237, 0.4)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.arc(x, y, 120, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 24px Inter'; ctx.textAlign = 'center';
      ctx.fillText('Demo Mode', 320, 230);
      requestAnimationFrame(draw);
    };
    draw();
    const videoTrack = canvas.captureStream(30).getVideoTracks()[0];
    return new MediaStream([videoTrack]); // No audio track needed for dummy
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const handleEndSession = () => {
    window.speechSynthesis.cancel();
    if (onEndInterview) {
      onEndInterview();
    } else {
      navigate('/dashboard'); // Default fallback
    }
  };

  // --- Render: LOBBY ---
  if (state === 'LOBBY') {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-4 lg:p-8 font-sans">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="order-2 lg:order-1 flex flex-col justify-center"
          >
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles size={12} /><span>AiCruiter Interface</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-6 leading-[0.9]">
                Ready for your <br /> interview?
              </h1>
              <p className="text-xl text-black/60 leading-relaxed max-w-md">
                We'll start with a quick technical screening. The AI will ask you questions based on the job description.
              </p>
            </div>
            {/* Steps Visual */}
            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center font-bold text-lg bg-black text-white">1</div>
                <div><h4 className="font-bold text-lg">System Check</h4><p className="text-black/50">Camera and audio verified.</p></div>
              </div>
            </div>

            <button
              onClick={() => setState('ACTIVE')}
              className="w-full sm:w-auto px-10 h-16 bg-black text-white rounded-full text-lg font-bold shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              Start Interview <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <MediaPreview stream={stream} isMuted={isMuted} onToggleMute={toggleMute} error={error} />
          </motion.div>
        </div>
      </div>
    );
  }

  // --- Render: ACTIVE INTERVIEW ---
  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-sans overflow-hidden">

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-24 px-8 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">Recording</span>
            <span className="text-sm font-bold text-white font-mono">{formatTime(elapsedTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleEndSession} className="px-6 py-2.5 rounded-full border border-red-500/30 text-red-500 text-sm font-bold hover:bg-red-500/10 transition-colors flex items-center gap-2">
            <PhoneOff size={16} /> End Session
          </button>
        </div>
      </header>

      {/* Main AI Visualizer */}
      <main className="flex-1 flex flex-col items-center justify-center relative">
        <div className="relative w-96 h-96 flex items-center justify-center">
          {/* Animated Rings */}
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
          {/* Core */}
          <motion.div
            animate={{ boxShadow: isAISpeaking ? "0 0 100px 20px rgba(109, 40, 217, 0.4)" : "0 0 50px 10px rgba(109, 40, 217, 0.1)" }}
            className="relative z-10 w-40 h-40 rounded-full bg-black border border-[#6D28D9] flex items-center justify-center overflow-hidden"
          >
            <motion.div
              animate={{ scale: isAISpeaking ? [0.8, 1, 0.8] : 0.8 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-full h-full bg-gradient-to-tr from-[#6D28D9] to-black opacity-50 blur-xl"
            />
          </motion.div>
        </div>

        {/* Question Text */}
        <div className="mt-16 text-center max-w-2xl px-6 min-h-[100px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4"
            >
              <span className="text-[#6D28D9] text-xs font-bold tracking-widest uppercase">
                {isAISpeaking ? "AiCruiter Speaking" : "Listening..."}
              </span>
              <h3 className="text-2xl md:text-3xl font-light text-white leading-relaxed">
                "{QUESTIONS[currentQuestion]}"
              </h3>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* User Self-View */}
      <motion.div
        drag dragMomentum={false}
        className="absolute bottom-8 right-8 w-72 aspect-[4/3] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group cursor-move z-50"
      >
        <video ref={(ref) => { if (ref && stream) ref.srcObject = stream; }} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
        <div className="absolute top-4 right-4">
          <div className={cn("w-3 h-3 rounded-full border-2 border-black", isMuted ? "bg-red-500" : "bg-green-500")} />
        </div>
      </motion.div>
    </div>
  );
};