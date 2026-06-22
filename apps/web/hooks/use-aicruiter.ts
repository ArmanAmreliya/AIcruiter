import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { apolloClient } from '../lib/apollo-client';
import { 
  GET_DASHBOARD_DATA, 
  FETCH_JOB_BY_ID, 
  CREATE_JOB, 
  UPDATE_JOB, 
  DELETE_JOB,
  UPDATE_PROFILE
} from '../lib/graphql-queries';
import { User, Job, Activity, DashboardStats } from '../types';
import { toast } from 'sonner';

const DEFAULT_USER: User = {
  id: '',
  name: 'Loading...',
  company: '...',
  role: '',
  aiCredits: 0,
  email: '',
  website: '',
  notificationSettings: '{}'
};

export const useAiCruiter = () => {
  const router = useRouter();
  const { user: realClerkUser, isLoaded: realClerkLoaded } = useUser();
  
  const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // IMPORTANT: useMemo prevents a new object being created on every render.
  // Without this, the useEffect below would fire on every render (infinite loop)
  // because a new {} literal is never reference-equal to the previous one.
  const clerkUser = useMemo(() => {
    if (realClerkUser) return realClerkUser;
    if (isDev) return {
      id: 'demo-recruiter-id-123',
      fullName: 'Demo Recruiter',
      firstName: 'Demo',
      lastName: 'Recruiter',
      primaryEmailAddress: { emailAddress: 'recruiter@example.com' }
    } as any;
    return null;
  }, [realClerkUser, isDev]);

  const clerkLoaded = realClerkLoaded || isDev;
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Fetch Data from GraphQL
  const fetchJobById = useCallback(async (jobId: string) => {
    try {
      const { data } = await apolloClient.query<any>({
        query: FETCH_JOB_BY_ID,
        variables: { id: jobId },
        fetchPolicy: 'network-only',
      });
      return data?.job || null;
    } catch (error: any) {
      console.error("Fetch job error:", error);
      toast.error(error.message || "Failed to fetch job details");
      return null;
    }
  }, []);

  const fetchData = async () => {
    if (!clerkLoaded) return;
    if (!clerkUser) {
      setLoading(false);
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
        router.push('/login');
      }
      return;
    }

    try {
      console.log("Fetching dashboard data via GraphQL for user:", clerkUser.id);

      const { data } = await apolloClient.query<any>({
        query: GET_DASHBOARD_DATA,
        fetchPolicy: 'network-only',
      });

      if (data?.me) {
        setUser({
          id: data.me.id,
          name: data.me.fullName || 'Recruiter',
          company: data.me.companyName || 'Company',
          role: data.me.role || 'Recruiter',
          aiCredits: data.me.aiCredits || 0,
          email: data.me.email || '',
          website: data.me.website || '',
          notificationSettings: data.me.notificationSettings || '{}',
        });
      }

      if (data?.jobs) {
        const formattedJobs: Job[] = data.jobs.map((j: any) => ({
          id: j.id,
          title: j.title,
          description: j.description,
          status: j.status,
          candidateCount: j.candidateCount || 0,
          location: 'Remote',
          createdAt: j.createdAt,
        }));
        setJobs(formattedJobs);
      }

      if (data?.activities) {
        setRecentActivity(data.activities.map((a: any) => ({
          id: a.id,
          type: a.type,
          message: a.message,
          subtitle: a.subtitle,
          timestamp: a.timestamp,
          score: a.score
        })));
      }

      if (data?.candidates) {
        setCandidates(data.candidates.map((c: any) => ({
          id: c.id,
          createdAt: c.createdAt
        })));
      }

    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch & Subscription update
  useEffect(() => {
    if (clerkLoaded) {
      fetchData();
    }
  }, [clerkLoaded, clerkUser]);

  // 2. Calculated Stats
  const stats: DashboardStats = useMemo(() => {
    const totalCandidates = jobs.reduce((acc, job) => acc + (job.candidateCount || 0), 0);
    const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;

    return {
      totalCandidates,
      activeJobs,
      aiCredits: user?.aiCredits || 0,
      timeSavedHours: Math.round(totalCandidates * 0.5),
    };
  }, [jobs, user]);

  // 3. Create Job Function via GraphQL
  const createJob = async (
    title: string,
    description: string,
    duration: number = 15,
    interviewTypes: string[] = ["Technical"],
    experienceLevel: string = "Mid-Level"
  ) => {
    setLoading(true);
    try {
      if (!clerkUser) throw new Error("Not authenticated");

      const { data } = await apolloClient.mutate<any>({
        mutation: CREATE_JOB,
        variables: {
          title,
          description,
          durationMinutes: duration,
          interviewType: interviewTypes,
          experienceLevel
        }
      });

      // Refresh Data
      await fetchData();
      return data?.createJob;

    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 4. Update Job Function via GraphQL
  const updateJob = async (
    jobId: string,
    updates: {
      title?: string;
      job_role?: string;
      description?: string;
      duration_minutes?: number;
      interview_type?: string[];
      status?: 'ACTIVE' | 'DRAFT' | 'CLOSED';
      experienceLevel?: string;
    }
  ) => {
    setLoading(true);

    if (!clerkUser) {
      toast.error("You must be logged in to update an interview");
      setLoading(false);
      return null;
    }

    // Optimistic Update: Update UI immediately
    setJobs(prev => prev.map(job =>
      job.id === jobId
        ? { 
            ...job, 
            title: updates.title || job.title,
            description: updates.description || job.description,
            status: updates.status || job.status
          }
        : job
    ));

    try {
      const { data } = await apolloClient.mutate<any>({
        mutation: UPDATE_JOB,
        variables: {
          id: jobId,
          title: updates.title,
          description: updates.description,
          durationMinutes: updates.duration_minutes,
          interviewType: updates.interview_type,
          status: updates.status,
          experienceLevel: updates.experienceLevel
        }
      });

      toast.success("Interview updated successfully");
      await fetchData();
      return data?.updateJob;
    } catch (error: any) {
      console.error("Update job error:", error);
      toast.error(error.message || "Failed to update interview");
      await fetchData(); // Revert on error
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 5. Delete Job Function via GraphQL
  const deleteJob = async (jobId: string) => {
    // Optimistic Update: Remove immediately from UI
    setJobs((prev) => prev.filter((job) => job.id !== jobId));

    try {
      const { data } = await apolloClient.mutate<any>({
        mutation: DELETE_JOB,
        variables: { id: jobId }
      });

      if (data?.deleteJob) {
        toast.success("Interview deleted successfully");
      }
      await fetchData(); 
    } catch (error: any) {
      toast.error(error.message || "Failed to delete interview");
      await fetchData(); // Force re-fetch to restore state
    }
  };

  const updateProfile = async (fullName?: string, companyName?: string, role?: string, website?: string, notificationSettings?: string) => {
    setLoading(true);
    try {
      if (!clerkUser) throw new Error("Not authenticated");

      const { data } = await apolloClient.mutate<any>({
        mutation: UPDATE_PROFILE,
        variables: {
          fullName,
          companyName,
          role,
          website,
          notificationSettings
        }
      });

      await fetchData();
      return data?.updateProfile;
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fallbackUser = useMemo(() => {
    if (!clerkUser) return DEFAULT_USER;
    return {
      ...DEFAULT_USER,
      id: clerkUser.id,
      name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Recruiter',
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
    };
  }, [clerkUser]);

  const resolvedUser = useMemo(() => {
    if (!isMounted) return DEFAULT_USER;
    return user || fallbackUser;
  }, [isMounted, user, fallbackUser]);

  return {
    user: resolvedUser,
    jobs,
    recentActivity,
    candidates,
    stats,
    createJob,
    updateJob,
    deleteJob,
    fetchJobById,
    loading,
    refreshData: fetchData,
    updateProfile
  };
};
