import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { User, Job, Activity, DashboardStats } from '../types';
import { toast } from 'sonner';

export const useAiCruiter = () => {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data from Supabase
  const fetchJobById = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .maybeSingle(); // Safer than .single() for potential missing data

      if (error) throw error;
      return data;
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
        return;
      }

      console.log("Fetching dashboard data for user:", authUser.id);

      // A. Fetch Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.full_name || 'Recruiter',
          company: profile.company_name || 'Company',
          role: profile.role || 'Recruiter',
          aiCredits: profile.ai_credits || 0,
          email: profile.email || '',
        });
      }

      // B. Fetch Jobs (Explicitly use site-generated relationship name to avoid ambiguity)
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*, candidates!candidates_job_id_fkey(count)')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error("Jobs fetch error:", jobsError);
      }

      if (jobsData) {
        const formattedJobs: Job[] = jobsData.map((j: any) => ({
          id: j.id,
          title: j.title,
          description: j.description,
          status: j.status,
          candidateCount: j.candidates?.[0]?.count || 0, // Count from relation
          location: j.location,
          createdAt: j.created_at,
        }));
        setJobs(formattedJobs);
      }

      // C. Fetch Activities
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityError) {
        console.error("Activities fetch error:", activityError);
      }

      if (activityData) {
        setRecentActivity(activityData.map((a: any) => ({
          id: a.id,
          type: a.type,
          message: a.message,
          subtitle: a.subtitle,
          timestamp: a.created_at,
          score: a.score
        })));
      }

    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch
  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    fetchData();

    // Subscribe to specific tables for Realtime updates
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

  // 3. Create Job Function (Connected to Real DB)
  const createJob = async (
    title: string,
    description: string,
    duration: number,
    interviewTypes: string[]
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert into Supabase
      const { data, error } = await supabase.from('jobs').insert({
        user_id: user.id,
        title, // This maps to 'title', used as Job Position
        job_role: title, // Storing title as role too for now if schema requires
        description,
        duration_minutes: duration,
        interview_type: interviewTypes,
        status: 'ACTIVE',
        location: 'Remote' // Default
      })
        .select()
        .maybeSingle();

      if (error) throw error;

      // Add Activity Log
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'SYSTEM',
        message: 'New Job Created',
        subtitle: `${title} is now active`
      });

      // Refresh Data
      await fetchData();

      return data;

    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 4. Update Job Function
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

    // Get current user to ensure we are filtering by owner for RLS safety
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      toast.error("You must be logged in to update an interview");
      setLoading(false);
      return null;
    }

    // Optimistic Update: Update UI immediately
    setJobs(prev => prev.map(job =>
      job.id === jobId
        ? { ...job, ...updates, title: updates.title || job.title }
        : job
    ));

    try {
      // Use maybeSingle() and explicitly filter by user_id for RLS clarity
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .eq('user_id', authUser.id)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error("Interview not found or permission denied");
      }

      toast.success("Interview updated successfully");
      return data;
    } catch (error: any) {
      console.error("Update job error:", error);
      toast.error(error.message || "Failed to update interview");
      await fetchData(); // Revert on error
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 5. Delete Job Function
  const deleteJob = async (jobId: string) => {
    // Optimistic Update: Remove immediately from UI
    setJobs((prev) => prev.filter((job) => job.id !== jobId));

    // Also remove from stats locally
    // (Optional: deep clone stats and decrement activeJobs, but re-calculation via useMemo handles it if 'jobs' changes)

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast.success("Interview deleted successfully");

      // Background validation (optional, can skip if confident)
      // await fetchData(); 
    } catch (error: any) {
      // Revert if failed
      toast.error(error.message || "Failed to delete interview");
      await fetchData(); // Force re-fetch to restore state
    }
  };

  return {
    user: user || { name: 'Loading...', company: '...', aiCredits: 0, email: '', id: '', role: '' }, // Safe default
    jobs,
    recentActivity,
    stats,
    createJob,
    updateJob,
    deleteJob,
    fetchJobById,
    loading,
    refreshData: fetchData
  };
};
