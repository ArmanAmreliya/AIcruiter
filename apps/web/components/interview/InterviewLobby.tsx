import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '../../lib/react-router-dom-compat';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    Video,
    ArrowRight,
    Building2,
    Clock,
    AlertCircle,
    Loader2,
    ShieldCheck,
    Lock,
} from 'lucide-react';
import { PageLoader } from '../ui/PageLoader';
import { useTheme } from '../../context/ThemeContext';
import { MediaPreview } from './MediaPreview';
import { cn } from '../../lib/utils';
import { apolloClient } from '../../lib/apollo-client';
import { CREATE_CANDIDATE, FETCH_JOB_BY_ID } from '../../lib/graphql-queries';
import { toast } from 'sonner';

interface JobDetails {
    id: string;
    title: string;
    duration_minutes: number;
    user_id: string;
}

export const InterviewLobby = () => {
    const params = useParams<any>();
    const uniqueId = params.jobId || params.uniqueId;
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setTheme('light');
    }, [setTheme]);

    const [isLoading, setIsLoading] = useState(true);
    const [job, setJob] = useState<any>(null);
    const [companyName, setCompanyName] = useState('Company');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);

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
            if (!jobData) throw new Error('Job not found');

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

        setJoinError(null);
        setIsJoining(true);
        try {
            const { data: mutateData } = await apolloClient.mutate<any>({
                mutation: CREATE_CANDIDATE,
                variables: { jobId: uniqueId, name, email },
            });

            const candidate = mutateData?.createCandidate;
            if (!candidate) throw new Error('Failed to register candidate');

            toast.success('Access verified! Entering interview room...');

            if (typeof window !== 'undefined') {
                sessionStorage.setItem(`candidateId_${uniqueId}`, candidate.id);
                sessionStorage.setItem(`candidateName_${uniqueId}`, candidate.name);
            }

            navigate(`/interview/${uniqueId}/room`, {
                state: { candidateId: candidate.id, candidateName: candidate.name },
            });
        } catch (err: any) {
            console.error('Join error:', err);
            const errMsg = err.message || String(err);
            const hasAlreadyCompleted =
                errMsg.includes('ALREADY_COMPLETED') ||
                errMsg.includes('already completed') ||
                (err.graphQLErrors &&
                    err.graphQLErrors.some(
                        (ge: any) =>
                            ge.message?.includes('ALREADY_COMPLETED') ||
                            ge.extensions?.code === 'ALREADY_COMPLETED' ||
                            ge.extensions?.exception?.code === 'ALREADY_COMPLETED'
                    ));

            if (hasAlreadyCompleted) {
                const msg =
                    'This email has already attempted or completed this interview. Multiple attempts are not permitted.';
                setJoinError(msg);
                toast.error(msg);
            } else {
                setJoinError('Could not join interview. Please try again.');
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
            console.error('Media acquisition error:', err);
            setMediaError(err.message || 'Failed to access camera/microphone');
        }
    };

    const handleCloseTest = () => {
        setShowTestModal(false);
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            setMediaStream(null);
        }
    };

    if (isLoading) return <PageLoader />;

    if (!job) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-4">
                <AlertCircle size={48} className="text-red-500 mb-4 animate-bounce" />
                <h1 className="text-2xl font-bold mb-2">Interview link expired or invalid</h1>
                <p className="text-slate-500 max-w-sm">
                    The job interview session you are attempting to join might have been deleted, or the invitation has
                    expired.
                </p>
            </div>
        );
    }

    const guidelines = [
        {
            Icon: Lock,
            title: 'Single-Attempt Session',
            body: 'Once you enter the room, the session must be completed in one sitting. Leaving or refreshing will lock you out.',
        },
        {
            Icon: Video,
            title: 'Hardware Requirements',
            body: 'Active camera and microphone permissions are required. Test your equipment before entering.',
        },
        {
            Icon: ShieldCheck,
            title: 'Evaluation Integrity',
            body: 'The interview must be completed entirely by yourself. Session monitoring is active.',
        },
    ];

    return (
        <div
            className={cn(
                'fixed inset-0 flex flex-col font-sans overflow-hidden',
                theme === 'light' ? 'bg-[#F5F3FF] text-slate-900' : 'bg-[#0A0A0B] text-white'
            )}
        >
            {/* Ambient glows */}
            <div className="absolute top-[-15%] left-[-5%] w-[45%] h-[55%] rounded-full bg-violet-500/15 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-5%] w-[40%] h-[50%] rounded-full bg-fuchsia-500/10 blur-[100px] pointer-events-none" />

            {/* ── Top Nav Bar ── */}
            <header className="relative z-20 flex items-center justify-between px-6 md:px-10 h-16 shrink-0">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-violet-600 shadow-lg shadow-violet-500/40 flex items-center justify-center overflow-hidden">
                        <img
                            src="https://img.icons8.com/forma-thin/96/ffffff/bot.png"
                            alt="AIcruiter"
                            className="w-6 h-6 object-contain"
                        />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-violet-600">
                        AIcruiter
                    </span>
                </div>

                {/* Secure badge */}
                <div
                    className={cn(
                        'flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border',
                        theme === 'light'
                            ? 'bg-violet-50 border-violet-200 text-violet-600'
                            : 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                    )}
                >
                    <ShieldCheck size={11} />
                    Secure AI Node
                </div>
            </header>

            {/* ── Main Content ── */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 md:px-6 py-4 min-h-0">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className={cn(
                        'w-full max-w-4xl rounded-3xl shadow-2xl border backdrop-blur-md overflow-hidden flex flex-col md:flex-row',
                        theme === 'light'
                            ? 'bg-white/90 border-slate-200/70 shadow-slate-300/40'
                            : 'bg-[#111113]/90 border-white/5 shadow-black/60'
                    )}
                >
                    {/* ── Left Panel: Job info + Guidelines ── */}
                    <div
                        className={cn(
                            'md:w-[42%] shrink-0 flex flex-col p-6 md:p-8 border-b md:border-b-0 md:border-r',
                            theme === 'light'
                                ? 'bg-gradient-to-b from-violet-50/80 to-white/40 border-slate-200/60'
                                : 'bg-gradient-to-b from-violet-950/20 to-transparent border-white/5'
                        )}
                    >
                        {/* Job card */}
                        <div
                            className={cn(
                                'rounded-2xl p-4 border mb-5',
                                theme === 'light'
                                    ? 'bg-white border-slate-200/80 shadow-sm'
                                    : 'bg-white/5 border-white/8'
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold tracking-tight leading-snug truncate">
                                        {job.title}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                        <span
                                            className={cn(
                                                'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                                                theme === 'light'
                                                    ? 'bg-slate-100 text-slate-600'
                                                    : 'bg-white/8 text-slate-300'
                                            )}
                                        >
                                            {companyName}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1',
                                                theme === 'light'
                                                    ? 'bg-violet-50 text-violet-700'
                                                    : 'bg-violet-500/15 text-violet-300'
                                            )}
                                        >
                                            <Clock size={10} />
                                            {job.durationMinutes || 15} mins
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        'p-2.5 rounded-xl shrink-0',
                                        theme === 'light'
                                            ? 'bg-violet-100 text-violet-600'
                                            : 'bg-violet-500/15 text-violet-400'
                                    )}
                                >
                                    <Building2 size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Guidelines */}
                        <p
                            className={cn(
                                'text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5',
                                theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                            )}
                        >
                            <AlertCircle size={11} /> Important Guidelines
                        </p>
                        <div className="flex flex-col gap-3 flex-1">
                            {guidelines.map(({ Icon, title, body }, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'flex items-start gap-3 p-3 rounded-xl border text-xs leading-relaxed',
                                        theme === 'light'
                                            ? 'bg-white border-slate-200 text-slate-600 shadow-sm'
                                            : 'bg-white/5 border-white/8 text-slate-300'
                                    )}
                                >
                                    <Icon
                                        size={13}
                                        className={cn(
                                            'mt-0.5 shrink-0',
                                            theme === 'light' ? 'text-violet-500' : 'text-violet-400'
                                        )}
                                    />
                                    <div>
                                        <span
                                            className={cn(
                                                'font-bold mr-1',
                                                theme === 'light' ? 'text-slate-800' : 'text-slate-200'
                                            )}
                                        >
                                            {title}:
                                        </span>
                                        {body}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer note */}
                        <p
                            className={cn(
                                'text-[9px] mt-4 leading-relaxed',
                                theme === 'light' ? 'text-slate-400' : 'text-slate-600'
                            )}
                        >
                            By entering, you consent to secure audio &amp; video processing for recruitment evaluations
                            under compliance protocols.
                        </p>
                    </div>

                    {/* ── Right Panel: Form ── */}
                    <div className="flex-1 flex flex-col justify-center p-6 md:p-8">
                        {/* Heading */}
                        <div className="mb-6">
                            <h1 className="text-xl font-extrabold tracking-tight">
                                Candidate Verification
                            </h1>
                            <p
                                className={cn(
                                    'text-xs mt-1',
                                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                                )}
                            >
                                Enter your details to access the interview session.
                            </p>
                        </div>

                        <form onSubmit={handleJoin} className="flex flex-col gap-4">
                            {/* Full Name */}
                            <div>
                                <label
                                    className={cn(
                                        'block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1',
                                        theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                                    )}
                                >
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Jane Doe"
                                    className={cn(
                                        'w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 text-sm font-medium',
                                        theme === 'light'
                                            ? 'bg-slate-50 border-slate-200 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500'
                                            : 'bg-white/5 border-white/8 placeholder-slate-600 focus:bg-white/8 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 text-white'
                                    )}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    className={cn(
                                        'block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1',
                                        theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                                    )}
                                >
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="jane.doe@example.com"
                                    className={cn(
                                        'w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 text-sm font-medium',
                                        theme === 'light'
                                            ? 'bg-slate-50 border-slate-200 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500'
                                            : 'bg-white/5 border-white/8 placeholder-slate-600 focus:bg-white/8 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 text-white'
                                    )}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (joinError) setJoinError(null);
                                    }}
                                    required
                                />
                                <AnimatePresence>
                                    {joinError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-red-500 ml-1"
                                        >
                                            <AlertCircle size={12} className="shrink-0" />
                                            <span>{joinError}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Divider */}
                            <div
                                className={cn(
                                    'h-px',
                                    theme === 'light' ? 'bg-slate-100' : 'bg-white/5'
                                )}
                            />

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={isJoining}
                                whileHover={{ y: -1, scale: 1.005 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-500/25 border border-violet-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                            >
                                {isJoining ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Verifying Secure Connection...
                                    </>
                                ) : (
                                    <>
                                        Verify &amp; Enter Interview Room
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </motion.button>

                            {/* Test hardware */}
                            <button
                                type="button"
                                onClick={handleTestSystem}
                                className={cn(
                                    'w-full py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border',
                                    theme === 'light'
                                        ? 'text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                        : 'text-slate-400 border-white/8 hover:bg-white/5'
                                )}
                            >
                                <Mic size={13} />
                                Run Hardware &amp; Connection Check
                            </button>
                        </form>
                    </div>
                </motion.div>
            </main>

            {/* ── Hardware Test Modal ── */}
            <AnimatePresence>
                {showTestModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.75 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseTest}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            className={cn(
                                'relative w-full max-w-md rounded-3xl p-6 shadow-2xl border z-10',
                                theme === 'light' ? 'bg-white border-slate-200/80' : 'bg-[#121214] border-white/5'
                            )}
                        >
                            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
                                <ShieldCheck className="text-violet-600" size={18} />
                                Pre-Flight Hardware Preview
                            </h3>
                            <p
                                className={cn(
                                    'text-xs mb-5 leading-relaxed',
                                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                                )}
                            >
                                Confirm your camera is clean, microphone is capturing audio, and your connection is
                                healthy.
                            </p>
                            <div className="mb-5">
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
                                className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/20 border border-violet-500/30 transition-all active:scale-[0.98]"
                            >
                                Pass Check &amp; Return to Lobby
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
