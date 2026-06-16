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
    Globe
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
    // Join with profiles for company name ideally, or store company in jobs
    // For this snippet, we'll try to fetch linked profile data
}

export const InterviewLobby = () => {
    const { uniqueId } = useParams<{ uniqueId: string }>(); // This corresponds to :jobId in the route
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [isLoading, setIsLoading] = useState(true);
    const [job, setJob] = useState<any>(null); // Using any for flexibility with join
    const [companyName, setCompanyName] = useState('Company');

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    // System Check State
    const [checkingSystem, setCheckingSystem] = useState(false);

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
            // 1. Insert Candidate via GraphQL
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
            toast.success('Registered successfully! Entering interview room...');

            // Store in sessionStorage to persist across page refresh
            if (typeof window !== 'undefined') {
                sessionStorage.setItem(`candidateId_${uniqueId}`, candidate.id);
                sessionStorage.setItem(`candidateName_${uniqueId}`, candidate.name);
            }

            // 3. Navigate to Active Room
            navigate(`/interview/${uniqueId}/room`, { state: { candidateId: candidate.id, candidateName: candidate.name } });

        } catch (err: any) {
            console.error('Join error:', err);
            toast.error('Could not join interview. Please try again.');
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black text-center p-4">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2 dark:text-white">Interview Not Found</h1>
                <p className="text-gray-500">The link might be invalid or expired.</p>
            </div>
        );
    }

    return (
        <div className={cn(
            "min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 font-sans transition-colors duration-300",
            theme === 'light' ? "bg-gray-50 text-gray-900" : "bg-black text-white"
        )}>

            {/* Brand Header */}
            <div className="mb-8 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        AI
                    </div>
                    <span className="font-bold text-xl tracking-tight">AIcruiter</span>
                </div>
                <p className={cn("text-sm", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
                    AI-Powered Interview Platform
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border",
                    theme === 'light' ? "bg-white border-gray-100 shadow-gray-200/50" : "bg-zinc-900 border-zinc-800 shadow-black"
                )}
            >
                {/* Job Context Header */}
                <div className="p-8 pb-6 border-b border-dashed border-gray-100 dark:border-white/5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold leading-tight">{job.title}</h2>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                <span>{companyName}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> {job.durationMinutes || 15} min</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            <Building2 size={24} />
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-8 pt-6">
                    <form onSubmit={handleJoin} className="space-y-6">

                        {/* Inputs */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    className={cn(
                                        "w-full px-4 py-3.5 rounded-xl border outline-none transition-all",
                                        theme === 'light'
                                            ? "bg-gray-50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500"
                                            : "bg-black/40 border-zinc-700 focus:bg-black focus:border-blue-500"
                                    )}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Email Address <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    placeholder="your.email@example.com"
                                    className={cn(
                                        "w-full px-4 py-3.5 rounded-xl border outline-none transition-all",
                                        theme === 'light'
                                            ? "bg-gray-50 border-gray-200 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500"
                                            : "bg-black/40 border-zinc-700 focus:bg-black focus:border-blue-500"
                                    )}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Pre-flight Info */}
                        <div className={cn(
                            "p-5 rounded-2xl border text-sm",
                            theme === 'light'
                                ? "bg-blue-50/50 border-blue-100 text-blue-900"
                                : "bg-blue-900/10 border-blue-500/20 text-blue-200"
                        )}>
                            <h3 className="font-bold flex items-center gap-2 mb-3">
                                <AlertCircle size={16} /> Before you begin...
                            </h3>
                            <ul className="space-y-2.5 opacity-90">
                                <li className="flex items-center gap-2.5">
                                    <Wifi size={14} /> Ensure you have a stable internet connection
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Video size={14} /> Test your camera and microphone
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Globe size={14} /> Find a quiet, well-lit environment
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-2">
                            <button
                                type="submit"
                                disabled={isJoining}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isJoining ? (
                                    <>
                                        <Loader2 className="animate-spin" /> Joining...
                                    </>
                                ) : (
                                    <>
                                        Join Interview <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleTestSystem}
                                className={cn(
                                    "w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2",
                                    theme === 'light' ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-white/5"
                                )}
                            >
                                <Mic size={16} /> Test Audio & Video
                            </button>
                        </div>

                    </form>
                </div>
            </motion.div>

            <div className="mt-8 text-xs text-gray-400 text-center max-w-xs">
                By joining, you agree to our Terms of Service and Privacy Policy. This interview will be recorded for review purposes.
            </div>

            <AnimatePresence>
                {showTestModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseTest}
                            className="absolute inset-0 bg-black"
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={cn(
                                "relative w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border z-10",
                                theme === 'light' ? "bg-white border-gray-100" : "bg-zinc-900 border-zinc-800"
                            )}
                        >
                            <h3 className="text-xl font-bold mb-4">Device Preview Test</h3>
                            <p className={cn("text-sm mb-6", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
                                Check your camera feedback and speak into your microphone to verify audio levels.
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
                                className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98]"
                            >
                                Everything works, close preview
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
