import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, PhoneOff, AlertCircle, Loader2, Sparkles, User, Settings2 } from 'lucide-react';
import { LoadingLogo } from '../ui/LoadingLogo';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

export const InterviewSimulationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const { theme } = useTheme(); // Respect global theme

  const videoRef = useRef<HTMLVideoElement>(null);
  const selfViewRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<'LOBBY' | 'ROOM'>('LOBBY');
  const [micLevel, setMicLevel] = useState(0);

  // Simulation State
  const [aiState, setAiState] = useState<'LISTENING' | 'THINKING' | 'SPEAKING'>('LISTENING');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const QUESTIONS = [
    "Tell me about a challenging project you worked on recently.",
    "How do you handle disagreement with a colleague?",
    "Describe a time you had to learn a new technology quickly.",
    "Where do you see yourself in five years?"
  ];

  // 1. Initialize Camera (Lobby)
  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let animationFrame: number | null = null;

    const startCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);

        // Setup Video
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Setup Audio Analysis for Meter
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;
        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateMeter = () => {
          if (!analyser || !dataArray) return;
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setMicLevel(Math.min(100, (average / 128) * 100)); // Normalize roughly
          animationFrame = requestAnimationFrame(updateMeter);
        };
        updateMeter();

      } catch (err) {
        console.error("Camera error:", err);
        setError("Camera access denied. Please check your permissions.");
      }
    };

    startCamera();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
      if (audioContext) audioContext.close();
      window.speechSynthesis.cancel();
    };
  }, []);

  // Ensure video element gets stream updates when switching stages
  useEffect(() => {
    if (stage === 'LOBBY' && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    if (stage === 'ROOM' && selfViewRef.current && stream) {
      selfViewRef.current.srcObject = stream;
    }
  }, [stage, stream]);

  // 2. Interaction Loop (Room)
  useEffect(() => {
    if (stage !== 'ROOM') return;

    let timeoutId: NodeJS.Timeout;

    const runLoop = () => {
      if (aiState === 'LISTENING') {
        // Wait 3 seconds then think
        timeoutId = setTimeout(() => {
          setAiState('THINKING');
        }, 3000);
      } else if (aiState === 'THINKING') {
        // Wait 1.5 seconds then speak
        timeoutId = setTimeout(() => {
          setAiState('SPEAKING');
        }, 1500);
      } else if (aiState === 'SPEAKING') {
        speakQuestion();
      }
    };

    runLoop();

    return () => clearTimeout(timeoutId);
  }, [stage, aiState]);

  const speakQuestion = () => {
    const question = QUESTIONS[currentQuestionIndex];
    const utterance = new SpeechSynthesisUtterance(question);

    // Attempt to select a better voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) ||
      voices.find(v => v.lang.includes('en-US')) ||
      voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      setAiState('LISTENING');
      setCurrentQuestionIndex((prev) => (prev + 1) % QUESTIONS.length);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleJoin = () => {
    // Prime the speech synthesis engine on user interaction
    const silent = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(silent);
    setStage('ROOM');
  };

  const handleEnd = () => {
    window.speechSynthesis.cancel();
    if (isPreview) {
      // Close window or go back
      window.close();
      navigate('/dashboard/interviews');
    } else {
      navigate('/'); // Redirect candidates to Home or Thank You page
    }
  };

  return (
    <div className={cn(
      "min-h-screen font-sans overflow-hidden selection:bg-purple-500/30",
      theme === 'light' ? "bg-white text-black" : "bg-black text-white"
    )}>

      {/* PREVIEW BADGE */}
      {isPreview && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-2 pointer-events-none">
          <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider flex items-center gap-2 pointer-events-auto">
            <User size={12} /> Recruiter Preview Mode
          </div>
        </div>
      )}

      {/* --- STAGE 1: LOBBY --- */}
      {stage === 'LOBBY' && (
        <div className="h-screen flex flex-col items-center justify-center p-6 relative">
          {/* Background Grid */}
          <div className={cn(
            "absolute inset-0 bg-[size:40px_40px] pointer-events-none opacity-20",
            theme === 'light'
              ? "bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)]"
              : "bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]"
          )} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl relative z-10 border transition-colors",
              theme === 'light' ? "bg-white border-gray-100" : "bg-zinc-900 border-zinc-800"
            )}
          >
            <div className="text-center mb-8">
              <div className={cn(
                "inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 shadow-sm",
                theme === 'light' ? "bg-purple-100 text-purple-600" : "bg-white/10 text-white"
              )}>
                <Sparkles size={24} />
              </div>
              <h1 className={cn("text-3xl font-bold", theme === 'light' ? "text-black" : "text-white")}>System Check</h1>
              <p className={cn("mt-2", theme === 'light' ? "text-gray-500" : "text-zinc-400")}>Ensure your camera and microphone are working.</p>
            </div>

            {/* Video Preview */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-8 border shadow-inner">
              {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-zinc-900">
                  <AlertCircle size={48} className="mb-4" />
                  <p className="font-medium">{error}</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              )}

              {/* Mic Meter Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                <Mic size={20} className={cn("transition-colors", micLevel > 5 ? "text-green-400" : "text-white/50")} />
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500"
                    animate={{ width: `${micLevel}%` }}
                    transition={{ type: "tween", ease: "linear", duration: 0.05 }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button className={cn(
                "px-6 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-colors",
                theme === 'light' ? "bg-gray-100 hover:bg-gray-200 text-black" : "bg-white/5 hover:bg-white/10 text-white"
              )}>
                <Settings2 size={20} />
              </button>
              <button
                onClick={handleJoin}
                disabled={!!error || !stream}
                className="flex-1 px-10 py-4 bg-[#6D28D9] text-white rounded-full font-bold text-lg hover:bg-[#5b21b6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                Join Interview
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- STAGE 2: INTERVIEW ROOM --- */}
      {stage === 'ROOM' && (
        <div className={cn(
          "h-screen flex flex-col relative",
          theme === 'light' ? "bg-gray-50" : "bg-black"
        )}>

          {/* Header */}
          <header className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
            <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-sm">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <span className="text-xs font-mono font-bold text-white/90 tracking-widest">RECORDING</span>
            </div>
            <button
              onClick={handleEnd}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-2.5 rounded-full text-sm font-bold border border-red-500/20 transition-colors flex items-center gap-2"
            >
              <PhoneOff size={16} />
              End Session
            </button>
          </header>

          {/* Main AI View */}
          <main className="flex-1 flex flex-col items-center justify-center relative">
            {/* AI Core Animation */}
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Ripple Effect (Speaking) */}
              {aiState === 'SPEAKING' && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border border-purple-500/40"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                    className="absolute inset-0 rounded-full border border-purple-500/40"
                  />
                </>
              )}

              {/* Orbit Rings (Thinking) */}
              {aiState === 'THINKING' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className={cn(
                    "absolute inset-[-20px] rounded-full border border-t-purple-500/50 border-r-transparent border-b-transparent border-l-transparent",
                    theme === 'light' ? "border-t-purple-600" : "border-t-white/50"
                  )}
                />
              )}

              {/* Core Circle */}
              <motion.div
                animate={{
                  scale: aiState === 'SPEAKING' ? [1, 1.05, 1] : 1,
                  boxShadow: aiState === 'SPEAKING'
                    ? "0 0 60px 10px rgba(168,85,247,0.5)"
                    : aiState === 'THINKING'
                      ? "0 0 30px 5px rgba(168,85,247,0.2)"
                      : "0 0 0px 0px rgba(0,0,0,0)",
                }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "w-40 h-40 rounded-full flex items-center justify-center z-10 border transition-colors duration-500 shadow-2xl overflow-hidden",
                  theme === 'light'
                    ? "bg-white border-purple-100"
                    : "bg-black border-purple-600/50"
                )}
              >
                {aiState === 'THINKING' ? (
                  <LoadingLogo size={80} />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 opacity-90" />
                )}
              </motion.div>
            </div>

            {/* Status Text */}
            <div className="mt-16 h-12 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={aiState}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-2"
                >
                  <p className={cn(
                    "text-2xl font-light tracking-tight",
                    aiState === 'SPEAKING'
                      ? "text-purple-500 font-medium"
                      : (theme === 'light' ? "text-gray-500" : "text-white/80")
                  )}>
                    {aiState === 'LISTENING' && "I'm listening..."}
                    {aiState === 'THINKING' && "Thinking..."}
                    {aiState === 'SPEAKING' && "AiCruiter Agent"}
                  </p>
                  {aiState === 'LISTENING' && (
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: [4, 12, 4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className={cn("w-1 rounded-full", theme === 'light' ? "bg-black/20" : "bg-white/50")}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Self View (Bottom Right) */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 right-8 w-64 aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl"
          >
            <video
              ref={selfViewRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <div className="absolute bottom-3 left-3 text-[10px] font-bold text-white/80 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
              YOU
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
