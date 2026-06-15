import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Calendar, MoreVertical, Copy, BarChart3, Presentation, Users, Edit2, Trash2, AlertCircle, X, ExternalLink } from 'lucide-react';
import { useAiCruiter } from '../../hooks/use-aicruiter';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { PageLoader } from '../ui/PageLoader';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export const InterviewsListPage = () => {
    const { jobs, loading, deleteJob, refreshData } = useAiCruiter();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    if (loading) {
        return <PageLoader />;
    }

    const handleCopyLink = (jobId: string) => {
        const link = `${window.location.origin}/interview/${jobId}`;
        navigator.clipboard.writeText(link);
        toast.success("Candidate link copied to clipboard!");
    };

    const handlePreview = (jobId: string) => {
        const link = `${window.location.origin}/interview/${jobId}?preview=true`;
        window.open(link, '_blank');
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await deleteJob(deleteId);
            // Toast is handled in deleteJob hook, but we force a refresh to be sure
            await refreshData();
            setDeleteId(null);
        } catch (error) {
            console.error("Failed to delete", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans relative">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className={cn("text-3xl font-bold tracking-tight", theme === 'light' ? "text-black" : "text-white")}>Interviews</h1>
                    <p className={cn("text-sm mt-1", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
                        Manage your active interview sessions and recordings.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/jobs/new')}
                    className={cn(
                        "px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2",
                        theme === 'light' ? "bg-black text-white" : "bg-white text-black"
                    )}
                >
                    + New Interview
                </button>
            </div>

            <div className="grid gap-4">
                {jobs.length === 0 ? (
                    <div className={cn(
                        "text-center py-20 rounded-3xl border border-dashed flex flex-col items-center justify-center",
                        theme === 'light' ? "bg-gray-50 border-gray-200" : "bg-white/5 border-white/10"
                    )}>
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4", theme === 'light' ? "bg-white shadow-sm" : "bg-white/5")}>
                            <Video className={cn("w-8 h-8", theme === 'light' ? "text-gray-400" : "text-white/40")} />
                        </div>
                        <h3 className={cn("text-lg font-bold", theme === 'light' ? "text-gray-900" : "text-white")}>No interviews yet</h3>
                        <p className={cn("max-w-sm mt-1 mb-6 text-sm", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
                            Create a job to start generating interview sessions for candidates.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard/jobs/new')}
                            className="text-purple-600 font-bold hover:underline flex items-center gap-2"
                        >
                            Create your first interview <ExternalLink size={14} />
                        </button>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 group",
                                theme === 'light' ? "bg-white border-gray-100" : "bg-zinc-900 border-white/10"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                                    theme === 'light' ? "bg-purple-50 text-purple-600" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                )}>
                                    <Video size={24} />
                                </div>
                                <div>
                                    <h3 className={cn("font-bold text-lg leading-tight mb-1", theme === 'light' ? "text-black" : "text-white")}>
                                        {job.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} /> Created {new Date(job.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users size={14} /> {job.candidateCount} Candidates
                                        </span>
                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                                            job.status === 'ACTIVE'
                                                ? (theme === 'light' ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-400 border border-green-500/20")
                                                : (theme === 'light' ? "bg-gray-100 text-gray-600" : "bg-white/10 text-white/60")
                                        )}>
                                            {job.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => navigate(`/dashboard/candidates`)}
                                    className={cn(
                                        "px-4 py-2 text-sm font-bold rounded-xl transition-colors flex items-center gap-2",
                                        theme === 'light'
                                            ? "bg-black text-white hover:bg-zinc-800"
                                            : "bg-white text-black hover:bg-gray-200"
                                    )}
                                >
                                    <BarChart3 size={16} />
                                    <span>View Results</span>
                                </button>

                                <button
                                    onClick={() => handleCopyLink(job.id)}
                                    className={cn(
                                        "p-2.5 rounded-xl border transition-colors relative group/tooltip",
                                        theme === 'light'
                                            ? "border-gray-200 hover:bg-gray-50 text-gray-600"
                                            : "border-white/10 hover:bg-white/5 text-gray-400 hover:text-white"
                                    )}
                                    title="Copy Candidate Link"
                                >
                                    <Copy size={18} />
                                </button>

                                <button
                                    onClick={() => handlePreview(job.id)}
                                    className={cn(
                                        "p-2.5 rounded-xl border transition-colors",
                                        theme === 'light'
                                            ? "border-gray-200 hover:bg-gray-50 text-gray-600"
                                            : "border-white/10 hover:bg-white/5 text-gray-400 hover:text-white"
                                    )}
                                    title="Preview Interview as Candidate"
                                >
                                    <Presentation size={18} />
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === job.id ? null : job.id)}
                                        className={cn(
                                            "p-2.5 rounded-xl transition-colors",
                                            theme === 'light'
                                                ? "hover:bg-gray-100 text-gray-400 hover:text-black"
                                                : "hover:bg-white/10 text-white/40 hover:text-white",
                                            activeMenu === job.id && (theme === 'light' ? "bg-gray-100 text-black" : "bg-white/10 text-white")
                                        )}
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    <AnimatePresence>
                                        {activeMenu === job.id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-30"
                                                    onClick={() => setActiveMenu(null)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    className={cn(
                                                        "absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border z-40 py-2 overflow-hidden",
                                                        theme === 'light' ? "bg-white border-gray-100 shadow-gray-200" : "bg-zinc-900 border-white/10 shadow-black"
                                                    )}
                                                >
                                                    <button
                                                        onClick={() => {
                                                            navigate(`/dashboard/jobs/new?edit=${job.id}`);
                                                            setActiveMenu(null);
                                                        }}
                                                        className={cn(
                                                            "w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors",
                                                            theme === 'light' ? "hover:bg-gray-50 text-gray-700" : "hover:bg-white/5 text-gray-300"
                                                        )}
                                                    >
                                                        <Edit2 size={16} />
                                                        <span>Edit Interview</span>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDeleteId(job.id);
                                                            setActiveMenu(null);
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 text-red-500 hover:bg-red-500/5 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                        <span>Delete Permanent</span>
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                                "w-full max-w-sm p-6 rounded-3xl shadow-2xl relative overflow-hidden",
                                theme === 'light' ? "bg-white text-black" : "bg-zinc-900 border border-white/10 text-white"
                            )}
                        >
                            <div className="flex flex-col items-center text-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Delete Interview?</h3>
                                    <p className={cn("text-sm", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
                                        This action cannot be undone. This will permanently delete this interview and all associated data.
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full mt-2">
                                    <button
                                        disabled={isDeleting}
                                        onClick={() => setDeleteId(null)}
                                        className={cn(
                                            "flex-1 px-4 py-3 rounded-xl font-bold transition-colors",
                                            theme === 'light' ? "bg-gray-100 hover:bg-gray-200 text-gray-700" : "bg-white/5 hover:bg-white/10 text-white"
                                        )}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={isDeleting}
                                        onClick={confirmDelete}
                                        className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center"
                                    >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};