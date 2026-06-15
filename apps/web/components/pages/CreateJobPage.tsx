import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2, ArrowRight, Check, Copy, LayoutDashboard, Clock, Tag, Briefcase, FileText } from 'lucide-react';
import { useAiCruiter } from '../../hooks/use-aicruiter';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

interface CreateJobPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const INTERVIEW_TYPES = [
  { id: 'Technical', icon: '< / >', label: 'Technical' },
  { id: 'Behavioral', icon: '👤', label: 'Behavioral' },
  { id: 'Experience', icon: '💼', label: 'Experience' },
  { id: 'Problem Solving', icon: '🧩', label: 'Problem Solving' },
  { id: 'Leadership', icon: '👥', label: 'Leadership' }
];

const DURATIONS = [15, 30, 45, 60];

export const CreateJobPage = ({ onBack, onSuccess }: CreateJobPageProps) => {
  const { theme } = useTheme();
  const location = useLocation();
  const { createJob, updateJob, fetchJobById, user } = useAiCruiter();

  // URL Params for Edit Mode
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('edit');
  const isEditMode = !!editId;

  // Form State
  const [jobPosition, setJobPosition] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(15);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Technical']);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(isEditMode);

  // Load existing data if in edit mode
  React.useEffect(() => {
    if (isEditMode && editId) {
      const loadJob = async () => {
        const job = await fetchJobById(editId);
        if (job) {
          setJobPosition(job.title);
          setDescription(job.description);
          setDuration(job.duration_minutes || 15);
          setSelectedTypes(job.interview_type || ['Technical']);
        }
        setIsInitialLoading(false);
      };
      loadJob();
    }
  }, [isEditMode, editId, fetchJobById]);

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobPosition || !description) {
      toast.error("Please fill in the job position and description.");
      return;
    }
    if (selectedTypes.length === 0) {
      toast.error("Please select at least one interview type.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && editId) {
        await updateJob(editId, {
          title: jobPosition,
          job_role: jobPosition, // Ensure role tracks title
          description,
          duration_minutes: duration,
          interview_type: selectedTypes
        });
        toast.success("Interview updated successfully!");
        onSuccess();
      } else {
        const newJob = await createJob(jobPosition, description, duration, selectedTypes);
        if (newJob) {
          setCreatedJobId(newJob.id);
          toast.success("AI Agent Deployed! Job created successfully.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(isEditMode ? "Failed to update job" : "Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdJobId) return;
    const link = `${window.location.origin}/interview/${createdJobId}`;
    navigator.clipboard.writeText(link);
    toast.success("Candidate link copied!");
  };

  const handleCreateAnother = () => {
    setCreatedJobId(null);
    setJobPosition('');
    setDescription('');
    setSelectedTypes(['Technical']);
    setDuration(15);
  };

  // --- SUCCESS STATE ---
  if (createdJobId) {
    return (
      <div className="max-w-xl mx-auto pt-10 text-center font-sans">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "rounded-3xl p-10 border shadow-2xl relative overflow-hidden",
            theme === 'light' ? "bg-white border-gray-100" : "bg-zinc-900 border-white/10"
          )}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-green-500/40 shadow-xl"
          >
            <Check size={40} strokeWidth={4} />
          </motion.div>

          <h2 className={cn("text-2xl font-bold mb-2", theme === 'light' ? "text-gray-900" : "text-white")}>
            Your AI Interview is Ready!
          </h2>
          <p className={cn("text-base mb-8", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
            Share this link with candidates to start the interview process for <span className="font-semibold text-purple-500">{jobPosition}</span>.
          </p>

          <div className={cn(
            "flex items-center gap-3 p-4 rounded-xl border mb-8 text-left",
            theme === 'light' ? "bg-gray-50 border-gray-200" : "bg-black/30 border-white/10"
          )}>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Interview Link</div>
              <div className={cn("font-mono text-sm truncate", theme === 'light' ? "text-black" : "text-white")}>
                {window.location.origin}/interview/{createdJobId}
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Copy size={16} /> Copy
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onSuccess}
              className={cn(
                "w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border",
                theme === 'light' ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-50" : "bg-transparent border-white/10 text-white hover:bg-white/5"
              )}
            >
              <LayoutDashboard size={18} />
              Back to Dashboard
            </button>
            <button
              onClick={handleCreateAnother}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              + Create New Interview
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- FORM STATE ---
  return (
    <div className="max-w-3xl mx-auto pt-4 font-sans pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className={cn(
            "p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors",
            theme === 'light' ? "text-gray-600" : "text-gray-300"
          )}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className={cn("text-2xl font-bold", theme === 'light' ? "text-gray-900" : "text-white")}>
          {isEditMode ? 'Edit Interview' : 'Create New Interview'}
        </h1>
      </div>

      {isInitialLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-600 mb-4" size={32} />
          <p className="text-sm opacity-50">Fetching interview details...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-2xl p-8 border shadow-sm",
            theme === 'light' ? "bg-white border-gray-200" : "bg-zinc-900 border-zinc-800"
          )}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Job Position */}
            <div className="space-y-2">
              <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>
                Job Position
              </label>
              <input
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border outline-none transition-all text-base",
                  theme === 'light'
                    ? "bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-900 placeholder:text-gray-400"
                    : "bg-black/40 border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder:text-zinc-600"
                )}
                disabled={isSubmitting}
              />
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>
                Job Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter detailed job description..."
                rows={6}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border outline-none transition-all text-base resize-none",
                  theme === 'light'
                    ? "bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-900 placeholder:text-gray-400"
                    : "bg-black/40 border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder:text-zinc-600"
                )}
                disabled={isSubmitting}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>
                Interview Duration
              </label>
              <div className="relative">
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border outline-none transition-all text-base appearance-none cursor-pointer",
                    theme === 'light'
                      ? "bg-white border-gray-200 focus:border-blue-500 text-gray-900"
                      : "bg-black/40 border-zinc-700 focus:border-blue-500 text-white"
                  )}
                  disabled={isSubmitting}
                >
                  {DURATIONS.map(d => (
                    <option key={d} value={d}>{d} minutes</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <Clock size={16} />
                </div>
              </div>
            </div>

            {/* Interview Types (Chips) */}
            <div className="space-y-3">
              <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>
                Interview Types
              </label>
              <div className="flex flex-wrap gap-3">
                {INTERVIEW_TYPES.map((type) => {
                  const isSelected = selectedTypes.includes(type.id);
                  return (
                    <motion.button
                      key={type.id}
                      type="button"
                      onClick={() => toggleType(type.id)}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 transition-all",
                        isSelected
                          ? "bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-100 ring-offset-0"
                          : (theme === 'light' ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-black/20 border-zinc-700 text-gray-300 hover:bg-white/5")
                      )}
                    >
                      <span className={isSelected ? "opacity-100" : "opacity-70"}>{type.id === 'Technical' ? '</>' : type.icon}</span>
                      {type.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* AI Generation Message (Only when submitting) */}
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-3 text-blue-800 dark:text-blue-200"
              >
                <Loader2 className="animate-spin shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-sm">Generating Interview Questions</h4>
                  <p className="text-xs mt-1 opacity-80">Our AI is crafting personalized questions based on your requirements...</p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={onBack}
                className={cn(
                  "px-6 py-3 rounded-xl font-semibold text-sm transition-colors",
                  theme === 'light' ? "text-gray-500 hover:bg-gray-100" : "text-gray-400 hover:bg-white/5"
                )}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : (isEditMode ? 'Update Interview' : 'Generate Questions')}
                {!isSubmitting && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};