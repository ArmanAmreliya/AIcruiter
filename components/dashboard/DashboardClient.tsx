
'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { useAiCruiter } from '../../hooks/use-aicruiter';
import { StatsGrid } from './StatsGrid';
import { VolumeChart } from './VolumeChart';
import { ActivityFeed, ActivityItem } from './ActivityFeed';

interface DashboardClientProps {
  onNavigateCreateJob?: () => void;
}

export const DashboardClient = ({ onNavigateCreateJob }: DashboardClientProps) => {
  const { theme } = useTheme();
  const { user, jobs, recentActivity, stats } = useAiCruiter();

  // Map strict Activity domain entity to ActivityItem prop for ActivityFeed
  const mappedActivityFeed: ActivityItem[] = recentActivity.map(a => ({
    id: a.id,
    type: a.type,
    title: a.message, // Map 'message' from domain to 'title' in UI
    subtitle: a.subtitle,
    createdAt: a.timestamp, // Map 'timestamp' from domain to 'createdAt' in UI
    score: a.score,
    avatarUrl: a.avatarUrl
  }));

  // --- EMPTY STATE CHECK ---
  if (jobs.length === 0) {
    return (
       <div className="min-h-[70vh] flex flex-col items-center justify-center text-center font-sans p-6 animate-fade-in-up">
          <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.5 }}
             className="mb-10 relative"
          >
             {/* Abstract Bot Illustration */}
             <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 bg-[#6D28D9]/20 rounded-full blur-3xl animate-pulse"></div>
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-2xl">
                   <rect x="60" y="80" width="80" height="70" rx="20" className={theme === 'light' ? "fill-black" : "fill-white"} />
                   <rect x="70" y="40" width="60" height="50" rx="16" className={theme === 'light' ? "fill-black" : "fill-white"} />
                   <circle cx="85" cy="65" r="5" className={theme === 'light' ? "fill-white animate-blink" : "fill-black animate-blink"} />
                   <circle cx="115" cy="65" r="5" className={theme === 'light' ? "fill-white animate-blink" : "fill-black animate-blink"} />
                   <line x1="100" y1="40" x2="100" y2="20" stroke={theme === 'light' ? "black" : "white"} strokeWidth="6" strokeLinecap="round"/>
                   <circle cx="100" cy="15" r="6" fill="#6D28D9" className="animate-pulse" />
                   <path d="M50 110 C 30 110, 30 90, 60 90" stroke={theme === 'light' ? "black" : "white"} strokeWidth="8" strokeLinecap="round" fill="none" />
                   <path d="M150 110 C 170 110, 170 90, 140 90" stroke={theme === 'light' ? "black" : "white"} strokeWidth="8" strokeLinecap="round" fill="none" />
                </svg>
                
                <motion.div 
                  animate={{ y: [-10, 10, -10] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-8 top-0 bg-white dark:bg-zinc-800 p-3 rounded-2xl shadow-xl border border-black/5 dark:border-white/10"
                >
                   <Sparkles size={20} className="text-[#6D28D9]" />
                </motion.div>
             </div>
          </motion.div>

          <h1 className={cn("text-4xl md:text-5xl font-bold tracking-tight mb-4", theme === 'light' ? "text-black" : "text-white")}>
             Ready to hire your first superstar?
          </h1>

          <p className={cn("text-xl max-w-xl mx-auto mb-10 leading-relaxed", theme === 'light' ? "text-black/60" : "text-white/60")}>
             Create your first AI-screened job post in seconds.
          </p>

          {onNavigateCreateJob ? (
            <motion.button
               onClick={onNavigateCreateJob}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="group relative px-10 py-5 bg-[#6D28D9] text-white rounded-full font-bold text-xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all flex items-center gap-4 overflow-hidden"
            >
               <span className="relative z-10">Create New Interview</span>
               <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform relative z-10" />
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </motion.button>
          ) : (
            <Link to="/dashboard/jobs/new">
              <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className="group relative px-10 py-5 bg-[#6D28D9] text-white rounded-full font-bold text-xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all flex items-center gap-4 overflow-hidden"
              >
                 <span className="relative z-10">Create New Interview</span>
                 <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform relative z-10" />
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </motion.button>
            </Link>
          )}
       </div>
    );
  }

  // --- ACTIVE DASHBOARD STATE ---
  return (
    <div className="space-y-8 font-sans animate-fade-in-up">
      
      {/* 1. Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className={cn("text-3xl lg:text-4xl font-bold tracking-tight mb-2", theme === 'light' ? "text-black" : "text-white")}>
            Good morning, {user.name.split(' ')[0]}
          </h2>
          <p className={cn("text-lg font-medium", theme === 'light' ? "text-black/60" : "text-white/60")}>
            Here is what's happening with your hiring pipeline.
          </p>
        </div>
        {onNavigateCreateJob ? (
          <motion.button 
            onClick={onNavigateCreateJob}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-[#6D28D9] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#5b21b6] transition-colors"
          >
            <Plus size={20} />
            Create New Job
          </motion.button>
        ) : (
          <Link to="/dashboard/jobs/new">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-[#6D28D9] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#5b21b6] transition-colors"
            >
              <Plus size={20} />
              Create New Job
            </motion.button>
          </Link>
        )}
      </div>

      {/* 2. Vital Stats Grid */}
      <StatsGrid stats={stats} />

      {/* 3. Main Analytics & 4. Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <VolumeChart />
        </motion.div>

        {/* Live Feed Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 h-full"
        >
           {/* Pass mapped activities from hook */}
           <ActivityFeed initialActivities={mappedActivityFeed} />
        </motion.div>

      </div>
    </div>
  );
};
