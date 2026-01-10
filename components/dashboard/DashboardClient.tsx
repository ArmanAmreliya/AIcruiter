
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { StatsGrid } from './StatsGrid';
import { VolumeChart } from './VolumeChart';
import { ActivityFeed, ActivityItem } from './ActivityFeed';
import type { DashboardStats } from '../../app/actions/dashboard';

interface DashboardClientProps {
  initialStats: DashboardStats;
  userName?: string;
}

export const DashboardClient = ({ initialStats, userName = "Alex" }: DashboardClientProps) => {
  const { theme } = useTheme();

  // --- EMPTY STATE CHECK ---
  // If no active jobs (and presuming no candidates), show the "First Time" Hero.
  if (initialStats.activeJobs === 0) {
    return (
       <div className="min-h-[80vh] flex flex-col items-center justify-center text-center font-sans">
          <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.5 }}
             className="mb-8 relative"
          >
             <div className={cn(
               "w-32 h-32 rounded-[2rem] flex items-center justify-center shadow-2xl",
               theme === 'light' ? "bg-black text-white" : "bg-white text-black"
             )}>
                <Sparkles size={48} />
             </div>
             {/* Decorative Elements */}
             <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#6D28D9] blur-xl opacity-50 animate-pulse"></div>
             <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-blue-500 blur-lg opacity-50"></div>
          </motion.div>

          <motion.h1 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className={cn("text-4xl md:text-5xl font-bold tracking-tight mb-4", theme === 'light' ? "text-black" : "text-white")}
          >
             Ready to hire your first superstar?
          </motion.h1>

          <motion.p 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.3 }}
             className={cn("text-xl max-w-xl mx-auto mb-10 leading-relaxed", theme === 'light' ? "text-black/60" : "text-white/60")}
          >
             You haven't posted any jobs yet. Create your first AI-screened interview in seconds and let the magic happen.
          </motion.p>

          <motion.button
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             transition={{ delay: 0.4 }}
             className="group relative px-8 py-4 bg-[#6D28D9] text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all flex items-center gap-3"
          >
             <span>Create New Interview</span>
             <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
             <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:scale-105 transition-transform"></div>
          </motion.button>
       </div>
    );
  }

  // --- NORMAL STATE (Active Dashboard) ---
  
  // Simulated initial data for active state
  const initialActivities: ActivityItem[] = [
    { 
      id: 1, 
      type: 'INTERVIEW',
      title: "Sarah J. completed interview", 
      score: 94,
      avatarUrl: "https://i.pravatar.cc/150?u=sarah",
      createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
      subtitle: "Frontend Developer Role"
    },
    { 
      id: 2, 
      type: 'APPLICATION',
      title: "New application for Frontend Dev", 
      subtitle: "Michael Chen applied via LinkedIn",
      avatarUrl: "https://i.pravatar.cc/150?u=michael",
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    { 
      id: 3, 
      type: 'AI',
      title: "AI flagged a high-potential match", 
      subtitle: "Candidate #4892 exceeds requirements",
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h2 className={cn("text-3xl lg:text-4xl font-bold tracking-tight mb-2", theme === 'light' ? "text-black" : "text-white")}>
            Good morning, {userName}
          </h2>
          <p className={cn("text-lg font-medium", theme === 'light' ? "text-black/60" : "text-white/60")}>
            Here is what's happening with your hiring pipeline.
          </p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-[#6D28D9] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#5b21b6] transition-colors"
        >
          <Plus size={20} />
          Create New Job
        </motion.button>
      </motion.div>

      {/* 2. Vital Stats Grid */}
      <StatsGrid stats={initialStats} />

      {/* 3. Main Analytics & 4. Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <VolumeChart />
        </motion.div>

        {/* Live Feed Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-1 h-full"
        >
           <ActivityFeed initialActivities={initialActivities} />
        </motion.div>

      </div>
    </div>
  );
};
