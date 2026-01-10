
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Video, Clock, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import type { DashboardStats } from '../../app/actions/dashboard';

interface StatsGridProps {
  stats: DashboardStats;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const { theme } = useTheme();

  const statItems = [
    { 
      label: "Total Candidates", 
      value: stats.totalCandidates.toLocaleString(), 
      icon: Users 
    },
    { 
      label: "Active Jobs", 
      value: stats.activeJobs.toLocaleString(), 
      icon: Video 
    },
    { 
      label: "Time Saved", 
      value: `${stats.timeSavedHours} hrs`, 
      icon: Clock 
    },
    { 
      label: "AI Credits", 
      value: stats.aiCredits.toLocaleString(), 
      icon: Sparkles 
    },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
    >
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className={cn(
            "p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between h-40",
            theme === 'light' 
              ? "bg-white border-black/5 hover:border-black/10 hover:shadow-lg" 
              : "bg-black border-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          )}
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#6D28D9]/10 rounded-2xl text-[#6D28D9]">
              <item.icon size={24} />
            </div>
          </div>
          <div>
            <p className={cn("text-sm font-medium mb-1", theme === 'light' ? "text-black/60" : "text-white/60")}>
              {item.label}
            </p>
            <h3 className={cn("text-3xl font-bold tracking-tight", theme === 'light' ? "text-black" : "text-white")}>
              {item.value}
            </h3>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
