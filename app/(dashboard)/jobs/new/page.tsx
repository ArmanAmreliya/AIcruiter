
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Wand2, Briefcase, FileText, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useAiCruiter } from '../../../../hooks/use-aicruiter';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../lib/utils';
import { toast } from 'sonner';

export default function CreateJobPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { createJob, user, loading } = useAiCruiter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createJob(title, description);
      toast.success("AI Agent Deployed! Job created successfully.");
      router.push('/dashboard');
    } catch (error) {
      toast.error("Failed to create job");
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-4 animate-fade-in-up">
      <Link 
        href="/dashboard"
        className={cn(
          "inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors hover:-translate-x-1 duration-200",
          theme === 'light' ? "text-black/60 hover:text-black" : "text-white/60 hover:text-white"
        )}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-3xl p-8 border shadow-sm relative overflow-hidden",
          theme === 'light' ? "bg-white border-black/5" : "bg-zinc-900 border-white/10"
        )}
      >
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white shadow-lg mb-6">
            <Wand2 size={24} />
          </div>
          <h1 className={cn("text-4xl font-bold tracking-tight mb-3", theme === 'light' ? "text-black" : "text-white")}>
            Let's hire your next rockstar.
          </h1>
          <p className={cn("text-lg", theme === 'light' ? "text-black/60" : "text-white/60")}>
            Describe the role, and our AI will generate the screening questions and interview structure automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-2">
            <label className={cn("text-sm font-bold flex items-center gap-2", theme === 'light' ? "text-black" : "text-white")}>
              <Briefcase size={16} className="text-purple-500" />
              Job Title
            </label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Product Designer"
              className={cn(
                "w-full px-4 py-4 rounded-xl border-2 outline-none transition-all text-lg font-medium",
                theme === 'light' 
                  ? "bg-gray-50 border-transparent focus:bg-white focus:border-purple-500 text-black placeholder:text-gray-400" 
                  : "bg-black/20 border-white/5 focus:bg-black/40 focus:border-purple-500 text-white placeholder:text-white/20"
              )}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className={cn("text-sm font-bold flex items-center gap-2", theme === 'light' ? "text-black" : "text-white")}>
              <FileText size={16} className="text-purple-500" />
              Job Description
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the job description here (responsibilities, requirements, perks)..."
              className={cn(
                "w-full px-4 py-4 rounded-xl border-2 outline-none transition-all min-h-[200px] resize-none text-base",
                theme === 'light' 
                  ? "bg-gray-50 border-transparent focus:bg-white focus:border-purple-500 text-black placeholder:text-gray-400" 
                  : "bg-black/20 border-white/5 focus:bg-black/40 focus:border-purple-500 text-white placeholder:text-white/20"
              )}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-dashed border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Sparkles size={14} className="text-purple-500" />
              <span>Cost: <span className="font-bold">50 Credits</span></span>
              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full ml-2">
                Available: {user.aiCredits}
              </span>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-[#6D28D9] text-white rounded-full font-bold text-lg shadow-[0_0_20px_rgba(109,40,217,0.3)] hover:shadow-[0_0_30px_rgba(109,40,217,0.5)] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Launch AI Agent
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
