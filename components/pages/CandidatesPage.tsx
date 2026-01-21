'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Check,
  X,
  MoreHorizontal,
  FolderPlus,
  User,
  BrainCircuit,
  Briefcase
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { PageLoader } from '../ui/PageLoader';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

// --- Types ---
type CandidateStatus = 'Pending' | 'Accepted' | 'Rejected';

interface Candidate {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  status: CandidateStatus;
  appliedDate: string;
  avatar?: string;
  jobId: string;
}

export const CandidatesPage = () => {
  const { theme } = useTheme();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'All'>('All');

  // Fetch Candidates from Supabase
  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // Use the explicit system-generated relationship name to resolve ambiguity
      const { data, error } = await supabase
        .from('candidates')
        .select('*, jobs!candidates_job_id_fkey(title)');

      if (error) throw error;

      if (data) {
        const formattedCandidates: Candidate[] = data.map((c: any) => ({
          id: c.id,
          name: c.name || 'Unknown Candidate',
          role: (c as any).jobs?.title || 'Unknown Role', // Access via explicit join key
          matchScore: c.overall_score || 0,
          status: (c.status as CandidateStatus) || 'Pending',
          appliedDate: c.created_at || new Date().toISOString(),
          jobId: c.job_id,
          // usage of UI avatars API for consistent avatars based on name
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'User')}&background=random`
        }));
        setCandidates(formattedCandidates);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      // toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // --- Filtering Logic ---
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const candidateName = c.name ? c.name.toLowerCase() : '';
      const candidateRole = c.role ? c.role.toLowerCase() : '';
      const query = searchQuery ? searchQuery.toLowerCase() : '';

      const matchesSearch = candidateName.includes(query) ||
        candidateRole.includes(query);

      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchQuery, statusFilter]);

  // --- Actions ---
  const handleStatusChange = async (id: string, newStatus: CandidateStatus) => {
    try {
      // Optimistic update
      setCandidates(prev => prev.map(c =>
        c.id === id ? { ...c, status: newStatus } : c
      ));

      const { error } = await supabase
        .from('candidates')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      const candidateName = candidates.find(c => c.id === id)?.name;
      const action = newStatus === 'Accepted' ? 'accepted' : 'rejected';

      toast(
        <div className="flex items-center gap-2">
          <div className={cn("p-1 rounded-full", newStatus === 'Accepted' ? "bg-green-500" : "bg-red-500")}>
            {newStatus === 'Accepted' ? <Check size={12} className="text-white" /> : <X size={12} className="text-white" />}
          </div>
          <span className="font-medium">Candidate {action}</span>
        </div>,
        {
          description: `${candidateName} has been moved to ${newStatus}.`,
        }
      );
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      fetchCandidates(); // Revert on error
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return theme === 'light' ? "bg-black text-green-400 border-black" : "bg-white text-green-600 border-white";
    if (score >= 70) return theme === 'light' ? "bg-white text-black border-black" : "bg-black text-white border-white";
    return theme === 'light' ? "bg-white text-red-600 border-red-200" : "bg-black text-red-400 border-red-900";
  };

  if (loading) {
    return <PageLoader />;
  }

  // --- Empty State: No Candidates at all ---
  if (candidates.length === 0) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-fade-in-up">
        <div className={cn(
          "p-8 rounded-full mb-6",
          theme === 'light' ? "bg-purple-50" : "bg-purple-900/10"
        )}>
          <User size={64} className="text-purple-500 opacity-50" />
        </div>
        <h2 className={cn("text-3xl font-bold mb-3", theme === 'light' ? "text-black" : "text-white")}>
          No Candidates Yet
        </h2>
        <p className={cn("text-lg mb-8 max-w-md text-center", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
          You haven't received any applications yet. Create a new interview to start finding candidates.
        </p>
        <Link
          to="/dashboard/jobs/new"
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105",
            theme === 'light'
              ? "bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20"
              : "bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10"
          )}
        >
          <FolderPlus size={20} />
          Create New Interview
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-8 font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className={cn("text-4xl font-bold tracking-tight mb-2", theme === 'light' ? "text-black" : "text-white")}>
            Candidate Pool
          </h1>
          <div className="flex items-center gap-2">
            <span className={cn("text-lg", theme === 'light' ? "text-black/60" : "text-white/60")}>
              Review and manage applications
            </span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold border",
              theme === 'light' ? "bg-black text-white border-black" : "bg-white text-black border-white"
            )}>
              {candidates.length}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={cn(
        "flex flex-col md:flex-row gap-4 p-4 rounded-2xl border transition-colors",
        theme === 'light' ? "bg-white border-black/5" : "bg-zinc-900 border-white/10"
      )}>
        <div className={cn(
          "flex-1 flex items-center px-4 py-3 rounded-xl border transition-all",
          theme === 'light'
            ? "bg-gray-50 border-transparent focus-within:bg-white focus-within:border-black focus-within:ring-4 focus-within:ring-black/5"
            : "bg-black border-white/10 focus-within:border-white focus-within:ring-4 focus-within:ring-white/5"
        )}>
          <Search size={18} className={cn("mr-3", theme === 'light' ? "text-black/40" : "text-white/40")} />
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-gray-400"
          />
        </div>

        <div className="flex gap-4">
          <div className="relative group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={cn(
                "appearance-none pl-4 pr-10 py-3 rounded-xl border font-bold text-sm outline-none cursor-pointer min-w-[140px] transition-all",
                theme === 'light'
                  ? "bg-white border-black/10 hover:border-black text-black"
                  : "bg-black border-white/10 hover:border-white text-white"
              )}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
            <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={cn(
        "rounded-3xl border overflow-hidden shadow-sm",
        theme === 'light' ? "bg-white border-black/5" : "bg-black border-white/10"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={cn(
                "border-b text-xs uppercase tracking-wider",
                theme === 'light' ? "border-black/5 text-black/40" : "border-white/10 text-white/40"
              )}>
                <th className="p-6 font-bold">Candidate</th>
                <th className="p-6 font-bold">Applied For</th>
                <th className="p-6 font-bold">AI Match</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredCandidates.map((candidate) => (
                  <motion.tr
                    key={candidate.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "group border-b last:border-b-0 transition-colors",
                      theme === 'light' ? "border-black/5 hover:bg-gray-50" : "border-white/5 hover:bg-white/5"
                    )}
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img src={candidate.avatar} alt={candidate.name} className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                        <div>
                          <div className={cn("font-bold text-sm", theme === 'light' ? "text-black" : "text-white")}>{candidate.name}</div>
                          <div className={cn("text-xs", theme === 'light' ? "text-black/50" : "text-white/50")}>{new Date(candidate.appliedDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={cn("flex items-center gap-2 text-sm font-medium", theme === 'light' ? "text-black/70" : "text-white/70")}>
                        <Briefcase size={14} />
                        {candidate.role}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm",
                        getScoreColor(candidate.matchScore)
                      )}>
                        <BrainCircuit size={12} />
                        {candidate.matchScore}%
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                        candidate.status === 'Accepted' && (theme === 'light' ? "bg-green-100 text-green-700" : "bg-green-900/30 text-green-400"),
                        candidate.status === 'Rejected' && (theme === 'light' ? "bg-red-100 text-red-700" : "bg-red-900/30 text-red-400"),
                        candidate.status === 'Pending' && (theme === 'light' ? "bg-gray-100 text-gray-700" : "bg-white/10 text-white/70"),
                      )}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {candidate.status === 'Pending' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStatusChange(candidate.id, 'Accepted')}
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-colors",
                                theme === 'light'
                                  ? "bg-white border-black/10 hover:bg-black hover:text-white hover:border-black"
                                  : "bg-black border-white/20 hover:bg-white hover:text-black hover:border-white"
                              )}
                              title="Accept"
                            >
                              <Check size={14} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStatusChange(candidate.id, 'Rejected')}
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-colors",
                                theme === 'light'
                                  ? "bg-white border-black/10 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                  : "bg-black border-white/20 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900"
                              )}
                              title="Reject"
                            >
                              <X size={14} />
                            </motion.button>
                          </>
                        )}
                        <button className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                          theme === 'light' ? "hover:bg-black/5" : "hover:bg-white/10"
                        )}>
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <User size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium">No candidates found for this search</p>
                      <p className="text-sm">Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
