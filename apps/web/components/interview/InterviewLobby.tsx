import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Assuming react-router-dom is used
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Mic,
    Video,
    Wifi,
    ArrowRight,
    Building2,
    Clock,
    AlertCircle,
    Loader2,
    Globe,
    ShieldCheck,
    Lock,
    Key
} from 'lucide-react';
import { LoadingLogo } from '../ui/LoadingLogo';
import { PageLoader } from '../ui/PageLoader';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { MediaPreview } from './MediaPreview';
import { cn } from '../../lib/utils';
import { apolloClient } from '../../lib/apollo-client';
import { CREATE_CANDIDATE, FETCH_JOB_BY_ID } from '../../lib/graphql-queries';
import { toast } from 'sonner';

// Types (should ideally be in a types file)
interface JobDetails {
    id: string;
    title: string;
    duration_minutes: number;
    user_id: string;
}

export const InterviewLobby = () => {
    const { uniqueId } = useParams<{ uniqueId: string }>(); // This corresponds to :jobId in the route
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setTheme('light');
    }, [setTheme]);

    const [isLoading, setIsLoading] = useState(true);
    const [job, setJob] = useState<any>(null); // Using any for flexibility with join
    const [companyName, setCompanyName] = useState('Company');

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    // Media Testing State
    const [showTestModal, setShowTestModal] = useState(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [mediaError, setMediaError] = useState<string | null>(null);

    useEffect(() => {
        fetchJobDetails();
    }, [uniqueId]);

    const fetchJobDetails = async () => {
        if (!uniqueId) return;
        try {
            setIsLoading(true);
            const { data } = await apolloClient.query<any>({
                query: FETCH_JOB_BY_ID,
                variables: { id: uniqueId },
                fetchPolicy: 'network-only',
            });

            const jobData = data?.job;
            if (!jobData) throw new Error("Job not found");

            setJob(jobData);

            if (jobData.user?.companyName) {
                setCompanyName(jobData.user.companyName);
            }

        } catch (err: any) {
            console.error('Error fetching job:', err);
            toast.error('Failed to load interview details. Invalid link?');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            toast.error('Please enter your full name and email.');
            return;
        }

        setIsJoining(true);
        try {
            // 1. Insert/Retrieve Candidate via GraphQL
            const { data: mutateData } = await apolloClient.mutate<any>({
                mutation: CREATE_CANDIDATE,
                variables: {
                    jobId: uniqueId,
                    name: name,
                    email: email,
                }
            });

            const candidate = mutateData?.createCandidate;
            if (!candidate) throw new Error("Failed to register candidate");

            // 2. Success Feedback
            toast.success('Access verified! Entering interview room...');

            // Store in sessionStorage to persist across page refresh
            if (typeof window !== 'undefined') {
                sessionStorage.setItem(`candidateId_${uniqueId}`, candidate.id);
                sessionStorage.setItem(`candidateName_${uniqueId}`, candidate.name);
            }

            // 3. Navigate to Active Room
            navigate(`/interview/${uniqueId}/room`, { state: { candidateId: candidate.id, candidateName: candidate.name } });

        } catch (err: any) {
            console.error('Join error:', err);
            if (err.message && (err.message.includes('ALREADY_COMPLETED') || err.message.includes('already completed'))) {
                toast.error('Access Denied: You have already completed this interview. Multiple attempts are not permitted.');
            } else {
                toast.error('Could not join interview. Please try again.');
            }
        } finally {
            setIsJoining(false);
        }
    };

    const handleTestSystem = async () => {
        setShowTestModal(true);
        setMediaError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setMediaStream(stream);
        } catch (err: any) {
            console.error("Media acquisition error:", err);
            setMediaError(err.message || "Failed to access camera/microphone");
        }
    };

    const handleCloseTest = () => {
        setShowTestModal(false);
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
        }
    };

    if (isLoading) {
        return <PageLoader />;
    }

    if (!job) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0A0A0B] text-center p-4">
                <AlertCircle size={48} className="text-red-500 mb-4 animate-bounce" />
                <h1 className="text-2xl font-bold mb-2 dark:text-white">Interview link expired or invalid</h1>
                <p className="text-slate-500 max-w-sm">The job interview session you are attempting to join might have been deleted, or the invitation has expired.</p>
            </div>
        );
    }

    return (
        <div className={cn(
            "relative min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 font-sans transition-colors duration-500 overflow-hidden",
            theme === 'light' ? "bg-slate-50 text-slate-900" : "bg-[#0A0A0B] text-white"
        )}>
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-500/10 blur-[120px] pointer-events-none" />

            {/* Brand Header */}
            <div className="mb-6 flex flex-col items-center relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-violet-500/30">
                        AI
                    </div>
                    <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">AIcruiter</span>
                </div>
                <p className={cn("text-xs font-semibold tracking-widest uppercase", theme === 'light' ? "text-slate-400" : "text-slate-500")}>
                    Secure AI Interviewer Node
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={cn(
                    "relative z-10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border backdrop-blur-md transition-all duration-500",
                    theme === 'light' ? "bg-white/95 border-slate-200/80 shadow-slate-200/50" : "bg-[#121214]/90 border-white/5 shadow-black/60"
                )}
            >
                {/* Job Context Header */}
                <div className="p-6 md:p-8 pb-5 border-b border-white/5 bg-gradient-to-b from-purple-500/5 to-transparent">
                    <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight truncate">{job.title}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-semibold tracking-wide">
                                <span className={cn("px-2.5 py-1 rounded-full", theme === 'light' ? "bg-slate-100 text-slate-700" : "bg-white/5 text-slate-300")}>{companyName}</span>
                                <span className={cn("px-2.5 py-1 rounded-full flex items-center gap-1.5", theme === 'light' ? "bg-purple-50 text-purple-700" : "bg-purple-500/10 text-purple-300")}>
                                    <Clock size={12} /> {job.durationMinutes || 15} mins
                                </span>
                            </div>
                        </div>
                        <div className="p-3 rounded-2xl bg-violet-600/10 text-violet-600 dark:text-violet-400 shrink-0">
                            <Building2 size={22} />
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-6 md:p-8 pt-5">
                    <form onSubmit={handleJoin} className="space-y-6">

                        {/* Inputs */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Jane Doe"
                                    className={cn(
                                        "w-full px-4 py-3 rounded-xl border outline-none transition-all duration-300 text-sm",
                                        theme === 'light'
                                            ? "bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-600"
                                            : "bg-[#1A1A1E] border-white/5 focus:bg-[#1A1A1E] focus:ring-4 focus:ring-violet-500/5 focus:border-violet-600 text-white"
                                    )}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="jane.doe@example.com"
                                    className={cn(
                                        "w-full px-4 py-3 rounded-xl border outline-none transition-all duration-300 text-sm",
                                        theme === 'light'
                                            ? "bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-600"
                                            : "bg-[#1A1A1E] border-white/5 focus:bg-[#1A1A1E] focus:ring-4 focus:ring-violet-500/5 focus:border-violet-600 text-white"
                                    )}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Security & Access Protection Info */}
                        <div className={cn(
                            "p-5 rounded-2xl border text-xs leading-relaxed space-y-4",
                            theme === 'light'
                                ? "bg-purple-50/50 border-purple-100 text-purple-900"
                                : "bg-purple-950/10 border-purple-500/10 text-purple-200"
                        )}>
                            <div className="flex items-center gap-2 font-bold text-sm tracking-tight text-violet-600 dark:text-purple-300">
                                <ShieldCheck size={16} /> Information Security & Access Policy
                            </div>
                            
                            <div className="grid gap-3.5">
                                <div className="flex items-start gap-2.5">
                                    <Lock size={12} className="mt-0.5 shrink-0 opacity-80" />
                                    <div>
                                        <span className="font-bold">One-Time Session Attempt:</span> Strict rate-limiting is applied. Once an interview is completed, you cannot make multiple attempts or register duplicate profiles.
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Key size={12} className="mt-0.5 shrink-0 opacity-80" />
                                    <div>
                                        <span className="font-bold">Low-Privilege Data Streaming:</span> Audio streams directly to isolated storage using temporary, write-only credentials (60s TTL) to prevent session-hijacking.
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Globe size={12} className="mt-0.5 shrink-0 opacity-80" />
                                    <div>
                                        <span className="font-bold">Transit & Rest Encryption:</span> Session feeds and metadata are protected with industry-standard TLS 1.3 in-transit and AES-256 at-rest.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-1">
                            <motion.button
                                type="submit"
                                disabled={isJoining}
                                whileHover={{ y: -1, scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold shadow-lg shadow-violet-500/20 border border-violet-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                            >
                                {isJoining ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} /> Verifying Secure Connection...
                                    </>
                                ) : (
                                    <>
                                        Verify & Enter Interview Room <ArrowRight size={16} />
                                    </>
                                )}
                            </motion.button>

                            <button
                                type="button"
                                onClick={handleTestSystem}
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                                    theme === 'light' ? "text-slate-600 hover:bg-slate-100" : "text-slate-400 hover:bg-white/5"
                                )}
                            >
                                <Mic size={14} /> Run Hardware & Connection Check
                            </button>
                        </div>

                    </form>
                </div>
            </motion.div>

            <div className="mt-6 text-[10px] text-slate-400 dark:text-slate-500 text-center max-w-xs relative z-10 leading-relaxed">
                By entering the interview room, you consent to secure audio and video processing for recruitment evaluations. Data is stored under compliance protocols.
            </div>

            <AnimatePresence>
                {showTestModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseTest}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className={cn(
                                "relative w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border z-10",
                                theme === 'light' ? "bg-white border-slate-200/80" : "bg-[#121214] border-white/5"
                            )}
                        >
                            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <ShieldCheck className="text-violet-600" size={20} /> Pre-Flight Hardware Preview
                            </h3>
                            <p className={cn("text-xs mb-6 leading-relaxed", theme === 'light' ? "text-slate-500" : "text-slate-400")}>
                                Confirm that your camera is clean, your microphone is capturing audio, and that your signal connection is healthy.
                            </p>
                            
                            <div className="mb-6">
                                <MediaPreview 
                                    stream={mediaStream}
                                    isMuted={isMuted}
                                    onToggleMute={() => setIsMuted(!isMuted)}
                                    error={mediaError}
                                />
                            </div>
                            
                            <button 
                                type="button"
                                onClick={handleCloseTest}
                                className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/20 border border-violet-500/30 transition-all active:scale-[0.98]"
                            >
                                Pass Check & Return to Lobby
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
