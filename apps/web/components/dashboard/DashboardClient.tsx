
'use client';

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { useAiCruiter } from '../../hooks/use-aicruiter';
import { StatsGrid } from './StatsGrid';
import { VolumeChart } from './VolumeChart';
import { ActivityFeed, ActivityItem } from './ActivityFeed';
import { PageLoader } from '../ui/PageLoader';

interface DashboardClientProps {
  onNavigateCreateJob?: () => void;
}

export const DashboardClient = ({ onNavigateCreateJob }: DashboardClientProps) => {
  const { theme } = useTheme();
  const { user, jobs, recentActivity, stats, loading } = useAiCruiter();
  const navigate = useNavigate();

  if (loading) {
    return <PageLoader />;
  }

  // Unified Navigate Action
  const handleCreateJob = () => {
    if (onNavigateCreateJob) {
      onNavigateCreateJob();
    } else {
      navigate('/dashboard/jobs/new');
    }
  };

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
          className="mb-8 relative"
        >
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-[#6D28D9]/10 rounded-full blur-2xl animate-pulse"></div>
            <img
              src="https://img.icons8.com/forma-thin/96/7950F2/bot.png"
              alt="Bot Icon"
              className="w-full h-full relative z-10 brightness-110"
            />
          </div>
        </motion.div>

        <h1 className={cn("text-4xl md:text-5xl font-bold tracking-tight mb-4", theme === 'light' ? "text-black" : "text-white")}>
          Ready to hire your first superstar?
        </h1>

        <p className={cn("text-xl max-w-xl mx-auto mb-10 leading-relaxed", theme === 'light' ? "text-black/60" : "text-white/60")}>
          Create your first AI-screened job post in seconds.
        </p>

        <motion.button
          onClick={handleCreateJob}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative px-10 py-5 bg-[#6D28D9] text-white rounded-full font-bold text-xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all flex items-center gap-4 overflow-hidden"
        >
          <span className="relative z-10">Create New Interview</span>
          <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform relative z-10" />
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </motion.button>
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
            Good morning, {user?.name?.split(' ')[0] || 'there'}
          </h2>
          <p className={cn("text-lg font-medium", theme === 'light' ? "text-black/60" : "text-white/60")}>
            Here is what's happening with your hiring pipeline.
          </p>
        </div>

        <motion.button
          onClick={handleCreateJob}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-[#6D28D9] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#5b21b6] transition-colors"
        >
          <Plus size={20} />
          Create New Job
        </motion.button>
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
