
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// --- Types ---
export type Job = {
  id: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'DRAFT' | 'CLOSED';
  candidatesCount: number;
  location: string;
  createdAt: string;
};

export type ActivityItem = {
  id: number;
  type: 'INTERVIEW' | 'APPLICATION' | 'AI' | 'SYSTEM';
  title: string;
  subtitle?: string;
  createdAt: string;
  score?: number;
  avatarUrl?: string;
};

export type UserProfile = {
  name: string;
  company: string;
  aiCredits: number;
  email: string;
};

interface DemoContextType {
  user: UserProfile;
  jobs: Job[];
  activities: ActivityItem[];
  createJob: (title: string, description: string) => Promise<string>;
  addCandidate: (jobId: string) => void;
  refreshActivity: () => void;
}

// --- Initial Data ---
const INITIAL_USER: UserProfile = {
  name: "Alex Morgan",
  company: "TechFlow",
  aiCredits: 850,
  email: "alex@techflow.com"
};

const INITIAL_JOBS: Job[] = [
  {
    id: "job_101",
    title: "Senior Frontend Engineer",
    description: "We are looking for a React expert...",
    status: "ACTIVE",
    candidatesCount: 14,
    location: "Remote",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
  },
  {
    id: "job_102",
    title: "Product Designer",
    description: "Design our next gen mobile app...",
    status: "ACTIVE",
    candidatesCount: 8,
    location: "San Francisco, CA",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
  }
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  { 
    id: 1, 
    type: 'INTERVIEW',
    title: "Sarah J. completed interview", 
    score: 94,
    avatarUrl: "https://i.pravatar.cc/150?u=sarah",
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    subtitle: "Senior Frontend Engineer"
  },
  { 
    id: 2, 
    type: 'APPLICATION',
    title: "New application for Product Designer", 
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

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  // Simulate "Create Job" API call
  const createJob = async (title: string, description: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newJob: Job = {
      id: `job_${Date.now()}`,
      title,
      description,
      status: 'ACTIVE',
      candidatesCount: 0,
      location: 'Remote',
      createdAt: new Date().toISOString(),
    };

    setJobs(prev => [newJob, ...prev]);
    
    // Deduct credits
    setUser(prev => ({ ...prev, aiCredits: prev.aiCredits - 50 }));

    // Add activity log
    const newActivity: ActivityItem = {
      id: Date.now(),
      type: 'SYSTEM',
      title: 'New Job Created',
      subtitle: `${title} is now active`,
      createdAt: new Date().toISOString()
    };
    setActivities(prev => [newActivity, ...prev]);

    return newJob.id;
  };

  const addCandidate = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, candidatesCount: job.candidatesCount + 1 } : job
    ));
    // Could add activity here too
  };

  const refreshActivity = () => {
    // Helper to force refresh or fetch new data
  };

  return (
    <DemoContext.Provider value={{ user, jobs, activities, createJob, addCandidate, refreshActivity }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
