import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
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

export const useAiCruiter = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data from GraphQL
  const fetchJobById = async (jobId: string) => {
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
  };

  const fetchData = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        console.warn("No authenticated user found for dashboard fetch:", authError);
        setLoading(false);
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
        return;
      }

      console.log("Fetching dashboard data via GraphQL for user:", authUser.id);

      const { data } = await apolloClient.query<any>({
        query: GET_DASHBOARD_DATA,
        fetchPolicy: 'network-only',
        context: {
          headers: {
            'x-user-id': authUser.id,
          }
        }
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

    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    fetchData();

    // Subscribe to specific tables for Realtime updates from Supabase triggers
    const channel = supabase.channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
    interviewTypes: string[] = ["Technical"]
  ) => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Not authenticated");

      const { data } = await apolloClient.mutate<any>({
        mutation: CREATE_JOB,
        variables: {
          title,
          description,
          durationMinutes: duration,
          interviewType: interviewTypes
        },
        context: {
          headers: {
            'x-user-id': authUser.id,
          }
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
    }
  ) => {
    setLoading(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
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
          status: updates.status
        },
        context: {
          headers: {
            'x-user-id': authUser.id,
          }
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

  const updateProfile = async (fullName?: string, companyName?: string, role?: string, website?: string) => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Not authenticated");

      const { data } = await apolloClient.mutate<any>({
        mutation: UPDATE_PROFILE,
        variables: {
          fullName,
          companyName,
          role,
          website
        },
        context: {
          headers: {
            'x-user-id': authUser.id,
          }
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

  return {
    user: user || { name: 'Loading...', company: '...', aiCredits: 0, email: '', id: '', role: '', website: '' }, // Safe default
    jobs,
    recentActivity,
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
