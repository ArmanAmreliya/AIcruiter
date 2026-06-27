import React, { useRef, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from '../../lib/react-router-dom-compat';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Maximize2, ShieldCheck, Loader2, ArrowRight, Moon, Sun, AlertTriangle, WifiOff, RefreshCw, MessageCircleQuestion } from 'lucide-react';
import { useAIInterviewer } from '../../hooks/useAIInterviewer';
import { useTheme } from '../../context/ThemeContext';
import { cn, parseJobDescription } from '../../lib/utils';
import { toast } from 'sonner';
import { apolloClient } from '../../lib/apollo-client';
import { FETCH_JOB_BY_ID } from '../../lib/graphql-queries';

export const InterviewRoom = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme, setTheme } = useTheme();

    useEffect(() => {
        setTheme('light');
    }, [setTheme]);

    // Keep the first render deterministic for SSR, then hydrate from route state/sessionStorage on mount.
    const [candidateId, setCandidateId] = useState('guest');
    const [candidateName, setCandidateName] = useState('Candidate');

    useEffect(() => {
        const storedCandidateId = typeof window !== 'undefined' ? sessionStorage.getItem(`candidateId_${jobId}`) : null;
        const storedCandidateName = typeof window !== 'undefined' ? sessionStorage.getItem(`candidateName_${jobId}`) : null;

        setCandidateId(location.state?.candidateId || storedCandidateId || 'guest');
        setCandidateName(location.state?.candidateName || storedCandidateName || 'Candidate');
    }, [jobId, location.state?.candidateId, location.state?.candidateName]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const [micActive, setMicActive] = useState(true);
    const [videoActive, setVideoActive] = useState(true);
    const [isOffline, setIsOffline] = useState(() => typeof window !== 'undefined' ? !window.navigator.onLine : false);
    const [networkMessage, setNetworkMessage] = useState<string | null>(null);
    const [voiceIssue, setVoiceIssue] = useState<string | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const [supportOpen, setSupportOpen] = useState(false);
    const [supportIssueType, setSupportIssueType] = useState('technical');
    const [supportDescription, setSupportDescription] = useState('');
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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
    const experienceLevel = job?.experienceLevel || 'Mid-Level';

    const { persona } = parseJobDescription(jobDescription);
    const personaName = persona === 'David' ? 'David' : persona === 'Emma' ? 'Emma' : 'Sarah';

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
        history,
        startInterview,
        speakWrapUp
    } = useAIInterviewer(jobId!, candidateId, candidateName, jobTitle, companyName, jobDescription, experienceLevel);

    // Auto-scroll transcript history container to the bottom on new dialogue or status updates
    useEffect(() => {
        if (transcriptEndRef.current) {
            transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history, status]);

    const [hasStarted, setHasStarted] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [isStartingInterview, setIsStartingInterview] = useState(false);
    const [isEndingInterview, setIsEndingInterview] = useState(false);
    const [wrapUpTriggered, setWrapUpTriggered] = useState(false);

    // --- Session Timer Effect ---
    useEffect(() => {
        if (wrapUpTriggered) return; // Freeze timer ticks during wrap-up speech

        if (timeLeft <= 0) {
            navigate(`/interview/thank-you?candidateId=${candidateId}&jobId=${jobId}&exitType=TIMEOUT&timeSpent=${sessionDuration}`);
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, navigate, candidateId, jobId, wrapUpTriggered, sessionDuration]);

    // --- Last Minute Wrap-up Trigger Effect ---
    useEffect(() => {
        if (hasStarted && timeLeft <= 60 && !wrapUpTriggered && !isEndingInterview) {
            setWrapUpTriggered(true);
            setIsEndingInterview(true);
            const goodbyeText = `Thank you so much for your time today. That's all the time we have for this interview. We will review your responses and announce the results through email shortly. Have a great day!`;
            
            toast.info("Wrapping up the interview...");

            // Set a fallback timeout (10s) in case speech playing fails or hangs
            const redirectTimeout = setTimeout(() => {
                console.warn("Speech wrap-up fallback redirect triggered.");
                navigate(`/interview/thank-you?candidateId=${candidateId}&jobId=${jobId}&exitType=TIMEOUT&timeSpent=${sessionDuration - timeLeft}`);
            }, 10000);

            speakWrapUp(goodbyeText, () => {
                clearTimeout(redirectTimeout);
                navigate(`/interview/thank-you?candidateId=${candidateId}&jobId=${jobId}&exitType=TIMEOUT&timeSpent=${sessionDuration - timeLeft}`);
            });
        }
    }, [timeLeft, hasStarted, wrapUpTriggered, isEndingInterview, candidateId, jobId, sessionDuration, speakWrapUp, navigate]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const localStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const rafRef = useRef<number | null>(null);
    const voiceWarningTimeoutRef = useRef<number | null>(null);

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

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleOffline = () => {
            setIsOffline(true);
            setNetworkMessage('Your connection dropped. Please check your internet and reload the page if the interview stalls.');
        };

        const handleOnline = () => {
            setIsOffline(false);
            setNetworkMessage(null);
        };

        const handleGlobalError = (event: ErrorEvent) => {
            const message = event?.message || '';
            if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('networkerror')) {
                setIsOffline(true);
                setNetworkMessage('We detected a network disruption. Please wait a moment and refresh the page if the interview does not recover.');
            }
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const message = event?.reason?.message || String(event?.reason || '');
            if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('networkerror')) {
                setIsOffline(true);
                setNetworkMessage('We detected a network disruption. Please wait a moment and refresh the page if the interview does not recover.');
            }
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    useEffect(() => {
        if (!localStreamRef.current || !cameraReady || !micActive) {
            setAudioLevel(0);
            if (voiceWarningTimeoutRef.current) {
                window.clearTimeout(voiceWarningTimeoutRef.current);
                voiceWarningTimeoutRef.current = null;
            }
            setVoiceIssue(null);
            return;
        }

        const stream = localStreamRef.current;
        const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

        if (!AudioContextCtor) {
            return;
        }

        const audioContext = new AudioContextCtor();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
            if (!analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray as Uint8Array);
            let sum = 0;
            for (let index = 0; index < dataArray.length; index += 1) {
                sum += dataArray[index];
            }
            const average = sum / dataArray.length;
            const normalized = Math.min(100, (average / 128) * 100);
            setAudioLevel(normalized);

            const shouldWarn = micActive && normalized < 6;
            if (shouldWarn) {
                if (!voiceWarningTimeoutRef.current) {
                    voiceWarningTimeoutRef.current = window.setTimeout(() => {
                        setVoiceIssue('Your microphone is not picking up your voice clearly. Please check your mic permissions or input device.');
                    }, 6000);
                }
            } else {
                if (voiceWarningTimeoutRef.current) {
                    window.clearTimeout(voiceWarningTimeoutRef.current);
                    voiceWarningTimeoutRef.current = null;
                }
                setVoiceIssue(null);
            }

            rafRef.current = window.requestAnimationFrame(tick);
        };

        tick();

        return () => {
            if (rafRef.current) {
                window.cancelAnimationFrame(rafRef.current);
            }
            if (voiceWarningTimeoutRef.current) {
                window.clearTimeout(voiceWarningTimeoutRef.current);
                voiceWarningTimeoutRef.current = null;
            }
            analyserRef.current = null;
            if (audioContextRef.current) {
                void audioContextRef.current.close();
                audioContextRef.current = null;
            }
        };
    }, [cameraReady, micActive]);

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
        if (!job || isStartingInterview || hasStarted) return;

        if (!window.navigator.onLine) {
            setNetworkMessage('You appear to be offline. Please reconnect and refresh the page before starting the interview.');
            toast.error('You are offline. Please reconnect and reload the page to continue.');
            return;
        }

        setIsStartingInterview(true);
        setHasStarted(true);

        try {
            await startInterview(localStreamRef.current || undefined);
        } catch (error) {
            console.error('Failed to start interview:', error);
            setNetworkMessage('The interview could not start because the connection dropped. Please reload the page and try again.');
            toast.error('The interview could not start. Please reload the page and try again.');
        } finally {
            setIsStartingInterview(false);
        }
    };

    const handleEndInterview = () => {
        if (isEndingInterview) return;

        if (window.confirm("Are you sure you want to end the interview? Your progress will be saved.")) {
            setIsEndingInterview(true);
            navigate(`/interview/thank-you?candidateId=${candidateId}&jobId=${jobId}&exitType=MANUAL&timeSpent=${sessionDuration - timeLeft}`);
            toast.success("Interview submitted successfully.");
        } else {
            setIsEndingInterview(false);
        }
    };

    const handleReloadPage = () => {
        window.location.reload();
    };

    const handleSubmitSupportReport = (event: React.FormEvent) => {
        event.preventDefault();
        if (!supportDescription.trim()) {
            toast.error('Please describe the issue so we can review it.');
            return;
        }

        setIsSubmittingReport(true);

        const report = {
            jobId,
            candidateId,
            candidateName,
            issueType: supportIssueType,
            description: supportDescription.trim(),
            networkState: isOffline ? 'offline' : 'online',
            voiceStatus: voiceIssue ? 'needs-attention' : 'healthy',
            status,
            timeLeft,
            audioLevel,
            timestamp: new Date().toISOString(),
        };

        if (typeof window !== 'undefined') {
            const existingReports = window.sessionStorage.getItem('aicruiter_support_reports');
            const parsedReports = existingReports ? JSON.parse(existingReports) : [];
            const nextReports = Array.isArray(parsedReports) ? [...parsedReports, report] : [report];
            window.sessionStorage.setItem('aicruiter_support_reports', JSON.stringify(nextReports));
            console.info('Interview support report saved:', report);
        }

        setSupportOpen(false);
        setSupportDescription('');
        setSupportIssueType('technical');
        toast.success('Support report saved. Our team will review it shortly.');
        setIsSubmittingReport(false);
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
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold tracking-wider text-purple-600 uppercase dark:text-purple-400">Live Interview</span>
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

                <div className="flex items-center gap-2">
                    <motion.button
                        type="button"
                        onClick={toggleTheme}
                        whileHover={{ y: -1, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "relative overflow-hidden flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all border rounded-full backdrop-blur-md shadow-lg shadow-purple-950/20",
                            theme === 'light'
                                ? "bg-purple-600 text-white border-purple-500/70 hover:bg-purple-500"
                                : "bg-purple-700 text-white border-purple-400/50 hover:bg-purple-600"
                        )}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        disabled={isStartingInterview || isEndingInterview}
                    >
                        <span className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 group-hover:opacity-100" />
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </motion.button>

                    <motion.button
                        type="button"
                        onClick={handleEndInterview}
                        whileHover={{ y: -1, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all border rounded-full shadow-lg shadow-purple-950/20",
                            isEndingInterview
                                ? "bg-purple-500/60 text-white border-purple-300/40 cursor-not-allowed"
                                : "bg-purple-600 text-white border-purple-500/70 hover:bg-purple-500"
                        )}
                        disabled={isStartingInterview || isEndingInterview}
                    >
                        {isEndingInterview ? <Loader2 size={16} className="animate-spin" /> : <PhoneOff size={16} />}
                        {isEndingInterview ? 'Ending...' : 'End Session'}
                    </motion.button>
                </div>
            </div>

            {/* Main Container */}
            <div className="relative flex-1 overflow-y-auto p-4 md:p-6">
                <AnimatePresence mode="wait">
                    {(networkMessage || voiceIssue) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={cn(
                                'mb-4 flex flex-wrap items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-sm',
                                isOffline
                                    ? 'border-amber-300 bg-amber-50 text-amber-900'
                                    : 'border-purple-200 bg-purple-50 text-purple-900'
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    'mt-0.5 rounded-full p-2',
                                    isOffline ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                                )}>
                                    {isOffline ? <WifiOff size={16} /> : <AlertTriangle size={16} />}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">
                                        {isOffline ? 'Connection issue detected' : 'Microphone check'}
                                    </div>
                                    <p className="text-sm leading-relaxed">
                                        {networkMessage || voiceIssue}
                                    </p>
                                </div>
                            </div>
                            {isOffline && (
                                <button
                                    type="button"
                                    onClick={handleReloadPage}
                                    className="flex items-center gap-2 rounded-full border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                                >
                                    <RefreshCw size={14} /> Reload page
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col gap-4 md:gap-6 min-h-full">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">

                {/* Left: AI Avatar Section */}
                <div className={cn(
                    "relative flex min-h-[320px] flex-col overflow-hidden rounded-3xl border p-6 md:min-h-[420px] md:p-8 transition-all duration-500 group",
                    theme === 'light' 
                        ? "bg-white border-slate-200/80 shadow-md shadow-slate-100" 
                        : "bg-black/40 border-white/5"
                )}>
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-purple-500/5 to-transparent" />

                    <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                        {!hasStarted ? (
                        <div className="flex flex-col items-center justify-center max-w-md p-6 text-center animate-fade-in">
                            <div className="flex items-center justify-center w-20 h-20 mb-6 border rounded-full bg-purple-500/10 border-purple-500/20 animate-pulse">
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
                                Make sure your camera and microphone are properly adjusted. Recruiter {personaName} is ready to guide you.
                            </p>
                            <button
                                onClick={handleStartInterview}
                                disabled={!cameraReady || !job || isStartingInterview || isEndingInterview}
                                className={cn(
                                    "relative overflow-hidden px-8 py-4 rounded-full font-bold shadow-lg transition-all duration-300 transform active:scale-95 flex items-center gap-3 border",
                                    cameraReady && job
                                        ? isStartingInterview
                                            ? "bg-purple-500 text-white border-purple-300/40 cursor-wait"
                                            : "bg-purple-600 hover:bg-purple-500 text-white border-purple-500/70 shadow-purple-500/20 hover:shadow-purple-500/30 pointer-events-auto cursor-pointer"
                                        : "bg-purple-950/30 text-purple-200/60 border-purple-500/20 cursor-not-allowed"
                                )}
                            >
                                {(isStartingInterview) ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} /> Starting Interview...
                                    </>
                                ) : !cameraReady ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} /> Connecting Hardware...
                                    </>
                                ) : !job ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} /> Loading Interview...
                                    </>
                                ) : (
                                    <>
                                        Start Interview with {personaName} <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-12 animate-fade-in">
                            <div className="text-center">
                                <h3 className={cn(
                                    "text-2xl font-bold mb-2 tracking-tight transition-colors duration-500",
                                    theme === 'light' ? "text-slate-800" : "text-white"
                                )}>Recruiter {personaName}</h3>
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
                                    <div className="w-4 h-4 rounded-full bg-white/20 blur-xl" />
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
                    </div>

                </div>

                {/* Right: Camera Feed */}
                <div className={cn(
                    "relative flex min-h-[320px] flex-col overflow-hidden rounded-3xl border shadow-2xl transition-all duration-500 md:min-h-[420px]",
                    theme === 'light' ? "bg-slate-100 border-slate-200" : "bg-zinc-900 border-white/5"
                )}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full min-h-[420px] w-full object-cover scale-x-[-1]"
                    />

                    <div className="absolute top-6 right-6">
                        <div className="flex items-center gap-2 px-3 py-1 border rounded-full bg-black/40 backdrop-blur-sm border-white/10">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">Recording</span>
                        </div>
                    </div>

                    <div className="absolute flex items-center justify-between gap-4 bottom-6 left-6 right-6">
                        <div className="flex items-center min-w-0 gap-3">
                            <div className="flex items-center justify-center w-10 h-10 border rounded-full bg-black/40 backdrop-blur-md border-white/10 shrink-0">
                                <Video size={18} className="text-white brightness-110" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-bold text-white truncate shadow-sm">{candidateName}</h4>
                                <p className="text-[10px] text-green-400 uppercase font-bold tracking-widest flex items-center gap-1">
                                    <ShieldCheck size={10} /> Secure Connection
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => setVideoActive(!videoActive)}
                                className={cn(
                                    "p-3 rounded-2xl backdrop-blur-md transition-all border shadow-lg shadow-purple-950/20",
                                    videoActive ? "bg-purple-600 text-white border-purple-400/60 hover:bg-purple-500" : "bg-purple-950/30 border-purple-500/20 text-purple-200/70 hover:bg-purple-900/40"
                                )}
                                disabled={isStartingInterview || isEndingInterview}
                            >
                                {videoActive ? <Video size={20} /> : <VideoOff size={20} />}
                            </button>
                            <button
                                onClick={() => setMicActive(!micActive)}
                                className={cn(
                                    "p-3 rounded-2xl backdrop-blur-md transition-all border shadow-lg shadow-purple-950/20",
                                    micActive ? "bg-purple-600 text-white border-purple-400/60 hover:bg-purple-500" : "bg-purple-950/30 border-purple-500/20 text-purple-200/70 hover:bg-purple-900/40"
                                )}
                                disabled={isStartingInterview || isEndingInterview}
                            >
                                {micActive ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Bottom: Transcript Component */}
                <div className={cn(
                    "rounded-3xl border p-3 md:p-4 py-2.5 md:py-3",
                    theme === 'light'
                        ? "bg-white border-slate-200/80 shadow-md shadow-slate-100"
                        : "bg-black/40 border-white/5"
                )}>
                <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-white/5">
                    <div className="flex items-center gap-2 text-purple-500 dark:text-purple-300">
                        <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                        <span className="text-xs font-bold tracking-wider uppercase">Transcript</span>
                    </div>
                    <div className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        status === 'LISTENING'
                            ? "text-green-500"
                            : status === 'SPEAKING'
                                ? "text-purple-500"
                                : "text-amber-500"
                    )}>
                        {status.toLowerCase()}
                    </div>
                </div>

                {status === 'LISTENING' && transcript && (
                    <div className={cn(
                        "mb-3 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-xs transition-colors duration-500",
                        theme === 'light'
                            ? "border-purple-100 bg-purple-50 text-purple-900"
                            : "border-purple-500/10 bg-purple-500/10 text-purple-100"
                    )}>
                        <div className="min-w-0 flex-1">
                            <div className={cn(
                                "mb-1 text-[10px] font-bold uppercase tracking-widest",
                                theme === 'light' ? "text-purple-600" : "text-purple-300"
                            )}>Listening</div>
                            <p className="leading-relaxed line-clamp-2">{transcript}</p>
                        </div>
                        <div className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest",
                            theme === 'light' ? "bg-white text-purple-600" : "bg-black/20 text-purple-200"
                        )}>
                            You
                        </div>
                    </div>
                )}

                <div className="max-h-[160px] overflow-y-auto space-y-2.5 pr-2 scrollbar-thin flex flex-col md:max-h-[200px] lg:max-h-[240px]">
                    {history.length === 0 ? (
                        <p className="py-8 text-sm italic text-center text-gray-400">No conversation started. Click "Start Interview" to begin.</p>
                    ) : (
                        history.map((msg, index) => (
                            <div
                                key={`${msg.role}-${index}-${msg.content.slice(0, 24)}`}
                                className={cn(
                                    "max-w-[85%] rounded-2xl p-3 text-xs flex flex-col",
                                    msg.role === 'assistant'
                                        ? theme === 'light'
                                            ? "bg-purple-50 text-purple-900 border border-purple-100 self-start"
                                            : "bg-purple-950/20 text-purple-200 border border-purple-500/10 self-start"
                                        : theme === 'light'
                                            ? "bg-slate-100 text-slate-800 border border-slate-200 self-end ml-auto"
                                            : "bg-zinc-800 text-zinc-100 border border-white/5 self-end ml-auto"
                                )}
                            >
                                <span className="mb-0.5 font-bold opacity-65">
                                    {msg.role === 'assistant' ? `${personaName} (AI Recruiter)` : 'You'}
                                </span>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        ))
                    )}
                    <div ref={transcriptEndRef} />
                </div>
                </div>
            </div>

            <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="fixed bottom-4 right-4 z-[80] flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-purple-950/20 transition hover:bg-purple-500 md:bottom-6 md:right-6"
            >
                <MessageCircleQuestion size={16} /> Help & Support
            </button>

            <AnimatePresence>
                {supportOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
                        >
                            <div className="mb-5 flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Need help with the interview?</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Share what happened and we will review it right away.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSupportOpen(false)}
                                    className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmitSupportReport} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Issue type</label>
                                    <select
                                        value={supportIssueType}
                                        onChange={(event) => setSupportIssueType(event.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                                    >
                                        <option value="technical">Technical issue</option>
                                        <option value="audio">Audio / microphone</option>
                                        <option value="network">Connection / network</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
                                    <textarea
                                        value={supportDescription}
                                        onChange={(event) => setSupportDescription(event.target.value)}
                                        rows={5}
                                        placeholder="Tell us what happened, when it started, and what you were doing when the problem appeared."
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSupportOpen(false)}
                                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingReport}
                                        className="flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-purple-400"
                                    >
                                        {isSubmittingReport ? <Loader2 size={16} className="animate-spin" /> : null}
                                        Save report
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
    );
};
