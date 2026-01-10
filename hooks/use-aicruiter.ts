
import { useState, useMemo } from 'react';
import { useDemo } from '../context/DemoContext';
import { User, Job, Activity, DashboardStats } from '../types';

export const useAiCruiter = () => {
  const { user: demoUser, jobs: demoJobs, activities: demoActivities, createJob: demoCreateJob } = useDemo();
  const [isCreating, setIsCreating] = useState(false);

  // Adapter: Map Demo User to Domain User
  const user: User = {
    id: 'user_current', // Mock ID
    name: demoUser.name,
    company: demoUser.company,
    role: 'Recruiter',
    aiCredits: demoUser.aiCredits,
    email: demoUser.email,
  };

  // Adapter: Map Demo Jobs to Domain Jobs
  const jobs: Job[] = demoJobs.map(j => ({
    id: j.id,
    title: j.title,
    description: j.description,
    status: j.status,
    candidateCount: j.candidatesCount,
    location: j.location,
    createdAt: j.createdAt,
  }));

  // Adapter: Map Demo Activities to Domain Activities
  const recentActivity: Activity[] = demoActivities.map(a => ({
    id: a.id,
    type: a.type as any,
    message: a.title, // Map title to message
    subtitle: a.subtitle,
    timestamp: a.createdAt, // Map createdAt to timestamp
    score: a.score,
    avatarUrl: a.avatarUrl,
  }));

  // Logic: Calculate Stats
  const stats: DashboardStats = useMemo(() => {
    const totalCandidates = jobs.reduce((acc, job) => acc + job.candidateCount, 0);
    const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
    // Heuristic: 30 mins saved per candidate
    const timeSavedHours = Math.round(totalCandidates * 0.5);

    return {
      totalCandidates,
      activeJobs,
      aiCredits: user.aiCredits,
      timeSavedHours,
    };
  }, [jobs, user.aiCredits]);

  // Logic: Create Job with State Management
  const createJob = async (title: string, description: string) => {
    setIsCreating(true);
    try {
      // Bridge to underlying provider
      await demoCreateJob(title, description);
    } finally {
      setIsCreating(false);
    }
  };

  return {
    user,
    jobs,
    recentActivity,
    stats,
    createJob,
    loading: isCreating,
  };
};
