import React, { useRef, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Maximize2, ShieldCheck, MessageSquare } from 'lucide-react';
import { useAIInterviewer } from '../../hooks/useAIInterviewer';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export const InterviewRoom = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { theme } = useTheme();

    // Extract candidate info from route state (passed from Lobby)
    const candidateId = location.state?.candidateId || 'guest-' + Math.random().toString(36).substr(2, 9);
    const candidateName = location.state?.candidateName || 'Candidate';
    const jobTitle = location.state?.jobTitle || 'Position';
    const companyName = location.state?.companyName || 'AIcruiter';

    const videoRef = useRef<HTMLVideoElement>(null);
    const [micActive, setMicActive] = useState(true);
    const [videoActive, setVideoActive] = useState(true);

    // Timer State
    const sessionDuration = location.state?.duration ? location.state.duration * 60 : 15 * 60; // Default 15 mins
    const [timeLeft, setTimeLeft] = useState(sessionDuration);

    const {
        status,
        transcript,
        aiResponse,
        startInterview
    } = useAIInterviewer(jobId!, candidateId, candidateName, jobTitle, companyName);

    // --- Session Timer Effect ---
    useEffect(() => {
        if (timeLeft <= 0) {
            navigate('/interview/thank-you', { state: { candidateId, jobId } });
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, navigate, candidateId, jobId]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Initialize Camera ---
    useEffect(() => {
        let stream: MediaStream | null = null;

        const initCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 },
                    audio: true
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Camera access denied:", error);
                toast.error("Camera and Mic access is required for the interview.");
            }
        };

        initCamera();

        // Start AI session automatically after a brief delay
        const timer = setTimeout(() => {
            startInterview();
        }, 2000);

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            clearTimeout(timer);
        };
    }, []);

    const handleEndInterview = () => {
        if (window.confirm("Are you sure you want to end the interview? Your progress will be saved.")) {
            navigate('/interview/thank-you', {
                state: {
                    candidateId,
                    jobId,
                    meta_data: {
                        exit_type: 'MANUAL',
                        time_spent: sessionDuration - timeLeft
                    }
                }
            });
            toast.success("Interview submitted successfully.");
        }
    };

    // --- Animation Variants for AI Orb ---
    const orbVariants = {
        IDLE: {
            scale: [1, 1.05, 1],
            opacity: 0.6,
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        },
        LISTENING: {
            scale: [1, 1.15, 1],
            boxShadow: "0 0 40px rgba(34, 197, 94, 0.5)",
            opacity: 0.9,
            transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
        },
        THINKING: {
            rotate: 360,
            opacity: 0.8,
            transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
        },
        SPEAKING: {
            scale: [1, 1.1, 0.95, 1.05, 1],
            boxShadow: "0 0 30px rgba(168, 85, 247, 0.6)",
            opacity: 1,
            transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
        }
    };

    return (
        <div className={cn(
            "fixed inset-0 z-50 flex flex-col transition-colors duration-500",
            theme === 'light' ? "bg-gray-50" : "bg-[#0A0A0B] text-white"
        )}>

            {/* Top Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Live Interview</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold opacity-40">Time Left</span>
                        <span className={cn(
                            "text-sm font-mono font-bold px-2 py-0.5 rounded-md",
                            timeLeft < 60 ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-white/5 text-white/80"
                        )}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleEndInterview}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full text-sm font-bold transition-all border border-red-500/20"
                >
                    <PhoneOff size={16} />
                    End Session
                </button>
            </div>

            {/* Main Container */}
            <div className="flex-1 relative flex flex-col md:flex-row items-stretch overflow-hidden p-6 gap-6">

                {/* Left: AI Avatar Section */}
                <div className="flex-[1.2] flex flex-col items-center justify-center relative p-8 rounded-3xl overflow-hidden bg-black/40 border border-white/5 group">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center gap-12">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-2 tracking-tight">Recruiter Sarah</h3>
                            <p className="text-sm opacity-50 font-medium tracking-wide first-letter:uppercase">{status.toLowerCase()}...</p>
                        </div>

                        {/* The Living Orb */}
                        <div className="relative">
                            <motion.div
                                variants={orbVariants}
                                animate={status}
                                className={cn(
                                    "w-48 h-48 rounded-full flex items-center justify-center relative blur-sm",
                                    status === 'SPEAKING' ? "bg-purple-500" :
                                        status === 'LISTENING' ? "bg-green-500" :
                                            status === 'THINKING' ? "bg-white" : "bg-purple-400"
                                )}
                            />
                            <motion.div
                                animate={status === 'SPEAKING' ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                <div className="w-4 h-4 bg-white/20 rounded-full blur-xl" />
                            </motion.div>
                        </div>

                        {/* Status Pill */}
                        <div className={cn(
                            "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                            status === 'SPEAKING' ? "bg-purple-500/20 border-purple-500/30 text-purple-400" :
                                status === 'LISTENING' ? "bg-green-500/20 border-green-500/30 text-green-400" :
                                    "bg-white/5 border-white/10 text-gray-400"
                        )}>
                            {status === 'SPEAKING' ? "AI SPEAKING" : status === 'LISTENING' ? "AI LISTENING" : "AI THINKING"}
                        </div>
                    </div>

                    {/* Real-time Subtitles (Floating Overlay) */}
                    <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-3">
                        <AnimatePresence>
                            {transcript && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 max-w-md self-end"
                                >
                                    <p className="text-sm font-medium italic opacity-80">{transcript}</p>
                                    <div className="text-[10px] font-bold text-gray-500 mt-1 uppercase">You</div>
                                </motion.div>
                            )}
                            {aiResponse && status === 'SPEAKING' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-purple-500/20 backdrop-blur-md rounded-2xl border border-purple-500/30 max-w-md"
                                >
                                    <p className="text-sm font-bold text-purple-200">{aiResponse}</p>
                                    <div className="text-[10px] font-bold text-purple-400 mt-1 uppercase text-right">Sarah</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Camera Feed & Local Controls */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex-1 rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden relative shadow-2xl">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover scale-x-[-1]"
                        />

                        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                                    <Video size={18} className="text-white brightness-110" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white shadow-sm">{candidateName}</h4>
                                    <p className="text-[10px] text-green-400 uppercase font-bold tracking-widest flex items-center gap-1">
                                        <ShieldCheck size={10} /> Secure Connection
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setVideoActive(!videoActive)}
                                    className={cn(
                                        "p-3 rounded-2xl backdrop-blur-md transition-all border",
                                        videoActive ? "bg-white/10 border-white/10 text-white" : "bg-red-500/20 border-red-500/30 text-red-500"
                                    )}
                                >
                                    {videoActive ? <Video size={20} /> : <VideoOff size={20} />}
                                </button>
                                <button
                                    onClick={() => setMicActive(!micActive)}
                                    className={cn(
                                        "p-3 rounded-2xl backdrop-blur-md transition-all border",
                                        micActive ? "bg-white/10 border-white/10 text-white" : "bg-red-500/20 border-red-500/30 text-red-500"
                                    )}
                                >
                                    {micActive ? <Mic size={20} /> : <MicOff size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Corner Info */}
                        <div className="absolute top-6 right-6">
                            <div className="px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">Recording</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Chat / Info */}
                    <div className="h-24 rounded-3xl bg-black/40 border border-white/5 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                                <MessageSquare size={20} className="text-white/40" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white/60">Subtitles</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Auto-enabled Nova-2</p>
                            </div>
                        </div>

                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={cn(
                                    "w-1 rounded-full bg-purple-500/40",
                                    status === 'LISTENING' ? "animate-bounce" : "h-1"
                                )} style={{ height: status === 'LISTENING' ? `${Math.random() * 16 + 8}px` : '4px', animationDelay: `${i * 0.1}s` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
