import React, { useRef, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Maximize2, ShieldCheck, MessageSquare, Loader2, ArrowRight } from 'lucide-react';
import { useAIInterviewer } from '../../hooks/useAIInterviewer';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { apolloClient } from '../../lib/apollo-client';
import { FETCH_JOB_BY_ID } from '../../lib/graphql-queries';

export const InterviewRoom = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { theme } = useTheme();

    // Extract candidate info from route state (passed from Lobby), falling back to sessionStorage to support page refresh
    const candidateId = location.state?.candidateId || (typeof window !== 'undefined' && sessionStorage.getItem(`candidateId_${jobId}`)) || 'guest-' + Math.random().toString(36).substr(2, 9);
    const candidateName = location.state?.candidateName || (typeof window !== 'undefined' && sessionStorage.getItem(`candidateName_${jobId}`)) || 'Candidate';

    const videoRef = useRef<HTMLVideoElement>(null);
    const [micActive, setMicActive] = useState(true);
    const [videoActive, setVideoActive] = useState(true);

    const [job, setJob] = useState<any>(null);

    // Fetch Job Details on mount
    useEffect(() => {
        if (!jobId) return;
        const fetchJobDetails = async () => {
            try {
                const { data } = await apolloClient.query<any>({
                    query: FETCH_JOB_BY_ID,
                    variables: { id: jobId },
                    fetchPolicy: 'cache-first',
                });
                if (data?.job) {
                    setJob(data.job);
                }
            } catch (err) {
                console.error("Error fetching job in room:", err);
            }
        };
        fetchJobDetails();
    }, [jobId]);

    const jobTitle = job?.title || 'Position';
    const companyName = job?.user?.companyName || 'AIcruiter';
    const jobDescription = job?.description || '';

    // Timer State
    const sessionDuration = location.state?.duration 
        ? location.state.duration * 60 
        : job?.durationMinutes 
            ? job.durationMinutes * 60 
            : 15 * 60; // Default 15 mins
    const [timeLeft, setTimeLeft] = useState(sessionDuration);

    // Sync timeLeft if job is loaded after initial state mount
    useEffect(() => {
        if (job?.durationMinutes && !location.state?.duration) {
            setTimeLeft(job.durationMinutes * 60);
        }
    }, [job, location.state?.duration]);

    const {
        status,
        transcript,
        aiResponse,
        startInterview
    } = useAIInterviewer(jobId!, candidateId, candidateName, jobTitle, companyName, jobDescription);

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

    const [hasStarted, setHasStarted] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const localStreamRef = useRef<MediaStream | null>(null);

    // --- Initialize Camera (With audio-only fallback) ---
    useEffect(() => {
        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 },
                    audio: true
                });
                localStreamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setCameraReady(true);
            } catch (error) {
                console.warn("Camera and Mic combined access failed, trying audio-only fallback:", error);
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });
                    localStreamRef.current = stream;
                    setVideoActive(false);
                    setCameraReady(true);
                    toast.warning("Camera could not be accessed. Proceeding with audio-only mode.");
                } catch (audioError) {
                    console.error("Audio-only access also denied:", audioError);
                    toast.error("Microphone access is required for the interview.");
                }
            }
        };

        initCamera();

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // --- Sync Microphone Mute State ---
    useEffect(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = micActive;
            });
        }
    }, [micActive]);

    // --- Sync Video Mute State ---
    useEffect(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = videoActive;
            });
        }
    }, [videoActive]);

    const handleStartInterview = async () => {
        if (!job) return;
        setHasStarted(true);
        if (localStreamRef.current) {
            await startInterview(localStreamRef.current);
        } else {
            await startInterview();
        }
    };

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
            theme === 'light' ? "bg-slate-50 text-slate-900" : "bg-[#0A0A0B] text-white"
        )}>

            {/* Top Header */}
            <div className={cn(
                "flex items-center justify-between px-6 py-4 border-b backdrop-blur-md transition-colors duration-500",
                theme === 'light' ? "border-slate-200 bg-white/80 text-slate-800" : "border-white/5 bg-black/20 text-white"
            )}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Live Interview</span>
                    </div>
                    <div className={cn(
                        "h-4 w-px",
                        theme === 'light' ? "bg-slate-200" : "bg-white/10"
                    )} />
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-[10px] uppercase font-bold",
                            theme === 'light' ? "text-slate-400" : "opacity-40"
                        )}>Time Left</span>
                        <span className={cn(
                            "text-sm font-mono font-bold px-2 py-0.5 rounded-md transition-colors duration-500",
                            timeLeft < 60 
                                ? "bg-red-500/20 text-red-500 animate-pulse" 
                                : theme === 'light' ? "bg-slate-100 text-slate-800" : "bg-white/5 text-white/80"
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
                <div className={cn(
                    "flex-[1.2] flex flex-col items-center justify-center relative p-8 rounded-3xl overflow-hidden border transition-all duration-500 group",
                    theme === 'light' 
                        ? "bg-white border-slate-200/80 shadow-md shadow-slate-100" 
                        : "bg-black/40 border-white/5"
                )}>
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

                    {!hasStarted ? (
                        <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 max-w-md animate-fade-in">
                            <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 animate-pulse">
                                <Video size={36} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className={cn(
                                "text-2xl font-bold mb-3 tracking-tight",
                                theme === 'light' ? "text-slate-800" : "text-white"
                            )}>Ready to begin your interview?</h3>
                            <p className={cn(
                                "text-sm mb-8 leading-relaxed",
                                theme === 'light' ? "text-slate-500" : "text-slate-400"
                            )}>
                                Make sure your camera and microphone are properly adjusted. Recruiter Sarah is ready to guide you.
                            </p>
                            <button
                                onClick={handleStartInterview}
                                disabled={!cameraReady || !job}
                                className={cn(
                                    "px-8 py-4 rounded-full font-bold shadow-lg transition-all duration-300 transform active:scale-95 flex items-center gap-3",
                                    cameraReady && job
                                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/20 hover:shadow-purple-500/30 pointer-events-auto cursor-pointer" 
                                        : "bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600"
                                )}
                            >
                                {!cameraReady ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} /> Connecting Hardware...
                                    </>
                                ) : !job ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} /> Loading Interview...
                                    </>
                                ) : (
                                    <>
                                        Start Interview with Sarah <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="relative z-10 flex flex-col items-center gap-12 animate-fade-in">
                            <div className="text-center">
                                <h3 className={cn(
                                    "text-2xl font-bold mb-2 tracking-tight transition-colors duration-500",
                                    theme === 'light' ? "text-slate-800" : "text-white"
                                )}>Recruiter Sarah</h3>
                                <p className={cn(
                                    "text-sm font-medium tracking-wide first-letter:uppercase transition-colors duration-500",
                                    theme === 'light' ? "text-slate-400" : "opacity-50"
                                )}>{status.toLowerCase()}...</p>
                            </div>

                            {/* The Living Orb */}
                            <div className="relative">
                                <motion.div
                                    variants={orbVariants}
                                    animate={status}
                                    className={cn(
                                        "w-48 h-48 rounded-full flex items-center justify-center relative blur-sm transition-colors duration-500",
                                        status === 'SPEAKING' ? "bg-purple-500" :
                                            status === 'LISTENING' ? "bg-green-500" :
                                                status === 'THINKING' ? (theme === 'light' ? "bg-purple-600" : "bg-white") : "bg-purple-400"
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
                                "px-4 py-2 rounded-full text-xs font-bold transition-all border duration-500",
                                status === 'SPEAKING' 
                                    ? "bg-purple-500/20 border-purple-500/30 text-purple-600 dark:text-purple-400" 
                                    : status === 'LISTENING' 
                                        ? "bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-400" 
                                        : theme === 'light' 
                                            ? "bg-slate-100 border-slate-200 text-slate-500" 
                                            : "bg-white/5 border-white/10 text-gray-400"
                            )}>
                                {status === 'SPEAKING' ? "AI SPEAKING" : status === 'LISTENING' ? "AI LISTENING" : "AI THINKING"}
                            </div>
                        </div>
                    )}

                    {/* Real-time Subtitles (Floating Overlay) */}
                    <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-3">
                        <AnimatePresence>
                            {transcript && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={cn(
                                        "p-4 backdrop-blur-md rounded-2xl border max-w-md self-end transition-all duration-500",
                                        theme === 'light' 
                                            ? "bg-slate-50/95 border-slate-200 text-slate-800 shadow-sm" 
                                            : "bg-black/60 border-white/10 text-white"
                                    )}
                                >
                                    <p className="text-sm font-medium italic">{transcript}</p>
                                    <div className={cn(
                                        "text-[10px] font-bold mt-1 uppercase transition-colors duration-500",
                                        theme === 'light' ? "text-slate-500" : "text-gray-500"
                                    )}>You</div>
                                </motion.div>
                            )}
                            {aiResponse && status === 'SPEAKING' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "p-4 backdrop-blur-md rounded-2xl border max-w-md transition-all duration-500",
                                        theme === 'light' 
                                            ? "bg-purple-50/90 border-purple-200 text-purple-900 shadow-sm" 
                                            : "bg-purple-500/20 border-purple-500/30 text-purple-200"
                                    )}
                                >
                                    <p className={cn(
                                        "text-sm font-semibold transition-colors duration-500",
                                        theme === 'light' ? "text-purple-900" : "text-purple-100"
                                    )}>{aiResponse}</p>
                                    <div className={cn(
                                        "text-[10px] font-bold mt-1 uppercase text-right transition-colors duration-500",
                                        theme === 'light' ? "text-purple-600" : "text-purple-400"
                                    )}>Sarah</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Camera Feed & Local Controls */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className={cn(
                        "flex-1 rounded-3xl overflow-hidden relative shadow-2xl transition-all duration-500 border",
                        theme === 'light' ? "bg-slate-100 border-slate-200" : "bg-zinc-900 border-white/5"
                    )}>
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
                    <div className={cn(
                        "h-24 rounded-3xl p-4 flex items-center justify-between border transition-all duration-500",
                        theme === 'light' 
                            ? "bg-white border-slate-200/80 shadow-md shadow-slate-100" 
                            : "bg-black/40 border-white/5"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-500",
                                theme === 'light' ? "bg-slate-100" : "bg-white/5"
                            )}>
                                <MessageSquare size={20} className={theme === 'light' ? "text-slate-400" : "text-white/40"} />
                            </div>
                            <div>
                                <p className={cn(
                                    "text-xs font-bold transition-colors duration-500",
                                    theme === 'light' ? "text-slate-700" : "text-white/60"
                                )}>Subtitles</p>
                                <p className={cn(
                                    "text-[10px] uppercase tracking-widest font-bold transition-colors duration-500",
                                    theme === 'light' ? "text-slate-400" : "text-white/30"
                                )}>Auto-enabled Nova-2</p>
                            </div>
                        </div>

                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={cn(
                                    "w-1 rounded-full transition-colors duration-500",
                                    theme === 'light' ? "bg-purple-600" : "bg-purple-500/40",
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
