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
  Briefcase,
  Mail,
  Calendar,
  Clock,
  Star,
  Activity,
  Award,
  BookOpen,
  Download
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { PageLoader } from '../ui/PageLoader';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { apolloClient } from '../../lib/apollo-client';
import { GET_CANDIDATES, UPDATE_CANDIDATE_STATUS } from '../../lib/graphql-queries';

// --- Types ---
interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  matchScore: number;
  status: string;
  appliedDate: string;
  avatar?: string;
  jobId: string;
  metaData?: {
    overallScore?: number;
    feedback?: string;
    candidateFeedback?: string;
    rating?: number;
    exit_type?: string;
    time_spent?: number;
    completed_at?: string;
  };
}

const formatDate = (dateInput?: any) => {
  if (!dateInput) return 'N/A';
  try {
    if (typeof dateInput === 'number') {
      return new Date(dateInput).toLocaleDateString();
    }
    if (typeof dateInput === 'string') {
      if (/^\d+$/.test(dateInput)) {
        return new Date(Number(dateInput)).toLocaleDateString();
      }
      const lower = dateInput.toLowerCase();
      if (lower === 'invalid date' || lower === 'null' || lower === 'undefined') {
        return 'N/A';
      }
      const parsed = Date.parse(dateInput);
      if (!isNaN(parsed)) {
        return new Date(parsed).toLocaleDateString();
      }
    }
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString();
    }
    return 'N/A';
  } catch (e) {
    return 'N/A';
  }
};

export const CandidatesPage = () => {
  const { theme } = useTheme();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setSearchStatusFilter] = useState<string>('All');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Fetch Candidates from GraphQL
  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data } = await apolloClient.query<any>({
        query: GET_CANDIDATES,
        fetchPolicy: 'network-only',
        context: {
          headers: {
            'x-user-id': authUser?.id || '',
          }
        }
      });

      if (data?.candidates) {
        const formattedCandidates: Candidate[] = data.candidates.map((c: any) => {
          let parsedMeta = {};
          if (c.metaData) {
            try {
              parsedMeta = typeof c.metaData === 'string' ? JSON.parse(c.metaData) : c.metaData;
            } catch (err) {
              console.error("Failed to parse candidate metaData:", err);
            }
          }
          return {
            id: c.id,
            name: c.name || 'Unknown Candidate',
            email: c.email || '',
            role: c.job?.title || 'Unknown Role',
            matchScore: c.overallScore || 0,
            status: c.status || 'STARTED',
            appliedDate: c.createdAt || new Date().toISOString(),
            jobId: c.jobId,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'User')}&background=7C3AED&color=fff`,
            metaData: parsedMeta
          };
        });
        setCandidates(formattedCandidates);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
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
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // Optimistic update
      setCandidates(prev => prev.map(c =>
        c.id === id ? { ...c, status: newStatus } : c
      ));

      if (selectedCandidate && selectedCandidate.id === id) {
        setSelectedCandidate(prev => prev ? { ...prev, status: newStatus } : null);
      }

      await apolloClient.mutate({
        mutation: UPDATE_CANDIDATE_STATUS,
        variables: { id, status: newStatus }
      });

      const candidateName = candidates.find(c => c.id === id)?.name;
      const action = newStatus === 'Accepted' ? 'accepted' : 'rejected';

      toast(
        <div className="flex items-center gap-2">
          <div className={cn("p-1 rounded-full", newStatus === 'Accepted' ? "bg-purple-600" : "bg-purple-400")}>
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
    if (score >= 90) return theme === 'light' ? "bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-500/20" : "bg-purple-600 text-white border-purple-500";
    if (score >= 70) return theme === 'light' ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-purple-900/30 text-purple-300 border-purple-880";
    if (score > 0) return theme === 'light' ? "bg-purple-55 text-purple-500 border-purple-100" : "bg-purple-950/20 text-purple-4/10 border-purple-950/20";
    return theme === 'light' ? "bg-zinc-100 text-zinc-500 border-zinc-200" : "bg-zinc-800 text-zinc-400 border-zinc-700";
  };

  const formatTimeSpent = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleDownloadPDF = () => {
    if (!selectedCandidate) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to download the PDF report.");
      return;
    }

    const { name, email, role, matchScore, appliedDate, metaData } = selectedCandidate;
    const feedbackText = metaData?.feedback || "No AI report generated.";
    const ratingText = metaData?.rating ? `${metaData.rating} / 5` : "N/A";
    const timeSpentText = formatTimeSpent(metaData?.time_spent);
    const exitTypeText = metaData?.exit_type || "Automatic";
    const candidateComments = metaData?.candidateFeedback ? `<h3>Candidate Experience Comments</h3><p><em>"${metaData.candidateFeedback}"</em></p>` : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>AIcruiter Report - ${name}</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1f2937; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #7c3aed; font-size: 28px; }
            .header p { margin: 5px 0 0 0; color: #6b7280; font-size: 14px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; background-color: #f9fafb; }
            .card h3 { margin-top: 0; color: #7c3aed; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
            .score-box { text-align: center; border-color: #ddd6fe; background-color: #f5f3ff; }
            .score-num { font-size: 48px; font-weight: 800; color: #7c3aed; margin: 10px 0; }
            .feedback-section { margin-bottom: 30px; border: 1px solid #e5e7eb; padding: 25px; border-radius: 16px; background-color: #fbfbfe; }
            .feedback-section h3 { margin-top: 0; color: #7c3aed; display: flex; align-items: center; gap: 8px; font-size: 14px; }
            .meta-item { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 8px; border-bottom: 1px dashed #e5e7eb; padding-bottom: 6px; }
            .meta-item:last-child { border-bottom: none; }
            .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AIcruiter Candidate Evaluation Report</h1>
            <p>Candidate: <strong>${name}</strong> (${email}) | Position: <strong>${role}</strong></p>
            <p>Applied Date: ${formatDate(appliedDate)}</p>
          </div>
          
          <div class="grid">
            <div class="card score-box">
              <h3>AI Match Score</h3>
              <div class="score-num">${matchScore > 0 ? `${matchScore}%` : 'Pending'}</div>
              <span style="font-size: 12px; font-weight: bold; color: #7c3aed; text-transform: uppercase; background: #ddd6fe; padding: 4px 10px; border-radius: 12px;">
                ${matchScore >= 90 ? 'Outstanding Match' : matchScore >= 70 ? 'Strong Match' : matchScore > 0 ? 'Review Needed' : 'Evaluation Pending'}
              </span>
            </div>
            
            <div class="card">
              <h3>Session Overview</h3>
              <div class="meta-item"><span>Time Spent:</span> <span>${timeSpentText}</span></div>
              <div class="meta-item"><span>Completion Mode:</span> <span>${exitTypeText}</span></div>
              <div class="meta-item"><span>Candidate Rating:</span> <span>${ratingText}</span></div>
              <div class="meta-item"><span>Evaluation Status:</span> <span>${selectedCandidate.status}</span></div>
            </div>
          </div>
          
          <div class="feedback-section">
            <h3>AI Recruitment Insights & Brief Report</h3>
            <p style="white-space: pre-line;">${feedbackText}</p>
          </div>
          
          ${candidateComments}
          
          <div class="footer">
            Report generated automatically by AIcruiter (c) 2026. All evaluation data is encrypted and confidential.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
              ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20"
              : "bg-purple-700 text-white hover:bg-purple-650 shadow-lg shadow-purple-950/30"
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
              theme === 'light' ? "bg-purple-600 text-white border-purple-500" : "bg-purple-500 text-white border-purple-400"
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
            ? "bg-gray-50 border-transparent focus-within:bg-white focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100"
            : "bg-black border-white/10 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/20 text-white"
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
              onChange={(e) => setSearchStatusFilter(e.target.value)}
              className={cn(
                "appearance-none pl-4 pr-10 py-3 rounded-xl border font-bold text-sm outline-none cursor-pointer min-w-[150px] transition-all",
                theme === 'light'
                  ? "bg-white border-black/10 hover:border-purple-500 text-black"
                  : "bg-black border-white/10 hover:border-purple-500 text-white"
              )}
            >
              <option value="All">All Status</option>
              <option value="STARTED">Interviewing</option>
              <option value="COMPLETED">Completed</option>
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
                    onClick={() => setSelectedCandidate(candidate)}
                    className={cn(
                      "group border-b last:border-b-0 transition-colors cursor-pointer",
                      theme === 'light' ? "border-black/5 hover:bg-purple-50/20" : "border-white/5 hover:bg-[#151220]/20"
                    )}
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img src={candidate.avatar} alt={candidate.name} className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                        <div>
                          <div className={cn("font-bold text-sm", theme === 'light' ? "text-black" : "text-white")}>{candidate.name}</div>
                          <div className={cn("text-xs", theme === 'light' ? "text-black/50" : "text-white/50")}>{formatDate(candidate.appliedDate)}</div>
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
                        {candidate.matchScore > 0 ? `${candidate.matchScore}%` : 'Pending'}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        candidate.status === 'Accepted' && (theme === 'light' ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-purple-950/40 text-purple-300 border-purple-850/50"),
                        candidate.status === 'Rejected' && (theme === 'light' ? "bg-zinc-150 text-zinc-650 border-zinc-250" : "bg-zinc-800/40 text-zinc-455 border-zinc-700/50"),
                        candidate.status === 'COMPLETED' && (theme === 'light' ? "bg-violet-100 text-violet-850 border-violet-200" : "bg-violet-950/40 text-violet-300 border-violet-850/50"),
                        candidate.status === 'STARTED' && (theme === 'light' ? "bg-indigo-100 text-indigo-850 border-indigo-200" : "bg-indigo-950/40 text-indigo-300 border-indigo-850/50"),
                      )}>
                        {candidate.status === 'STARTED' ? 'Interviewing' : candidate.status === 'COMPLETED' ? 'Completed' : candidate.status}
                      </span>
                    </td>
                    <td className="p-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {candidate.status !== 'Accepted' && candidate.status !== 'Rejected' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStatusChange(candidate.id, 'Accepted')}
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-colors",
                                theme === 'light'
                                  ? "bg-white border-black/10 hover:bg-purple-600 hover:text-white hover:border-purple-600"
                                  : "bg-black border-white/20 hover:bg-purple-600 hover:text-white hover:border-purple-600"
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
                                  ? "bg-white border-black/10 hover:bg-zinc-750 hover:text-white hover:border-zinc-750"
                                  : "bg-black border-white/20 hover:bg-zinc-750 hover:text-white hover:border-zinc-750"
                              )}
                              title="Reject"
                            >
                              <X size={14} />
                            </motion.button>
                          </>
                        )}
                        <button 
                          onClick={() => setSelectedCandidate(candidate)}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            theme === 'light' ? "hover:bg-purple-100/50" : "hover:bg-purple-900/20"
                          )}
                        >
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

      {/* Candidate Details Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="absolute inset-0 bg-transparent"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border z-10 max-h-[90vh] overflow-y-auto",
                theme === 'light' ? "bg-white border-slate-200 text-slate-800" : "bg-zinc-900 border-white/5 text-white"
              )}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCandidate(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-start gap-4 pb-6 border-b border-gray-100 dark:border-white/5">
                <img
                  src={selectedCandidate.avatar}
                  alt={selectedCandidate.name}
                  className="w-16 h-16 rounded-full bg-slate-100 border-2 border-purple-500 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight truncate">{selectedCandidate.name}</h3>
                  <p className={cn("text-sm font-medium flex items-center gap-1.5 mt-1", theme === 'light' ? "text-slate-500" : "text-slate-400")}>
                    <Mail size={14} className="text-purple-500" />
                    {selectedCandidate.email}
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs font-semibold">
                    <span className={cn("px-2.5 py-1 rounded-full flex items-center gap-1.5", theme === 'light' ? "bg-slate-100 text-slate-700" : "bg-white/5 text-zinc-300")}>
                      <Briefcase size={12} className="text-purple-500" />
                      {selectedCandidate.role}
                    </span>
                    <span className={cn("px-2.5 py-1 rounded-full flex items-center gap-1.5", theme === 'light' ? "bg-slate-100 text-slate-700" : "bg-white/5 text-zinc-300")}>
                      <Calendar size={12} className="text-purple-500" />
                      Applied: {formatDate(selectedCandidate.appliedDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="py-6 space-y-6">
                {/* Score and Match assessment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={cn("p-5 rounded-2xl border flex flex-col items-center justify-center text-center", theme === 'light' ? "bg-purple-50/30 border-purple-100/80 shadow-sm" : "bg-purple-950/5 border-purple-900/30")}>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-3">AI Recruiter Score</span>
                    <div className="relative flex items-center justify-center w-24 h-24 mb-3">
                      {/* Circular Gauge */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke={theme === 'light' ? '#F1F5F9' : '#27272A'} strokeWidth="8" fill="transparent" />
                        <circle cx="48" cy="48" r="40" stroke="#8B5CF6" strokeWidth="8" fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - selectedCandidate.matchScore / 100)}
                          strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-2xl font-extrabold text-purple-600 dark:text-purple-400">{selectedCandidate.matchScore > 0 ? `${selectedCandidate.matchScore}%` : 'N/A'}</span>
                    </div>
                    <span className={cn("text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border", getScoreColor(selectedCandidate.matchScore))}>
                      {selectedCandidate.matchScore >= 90 ? 'Outstanding Match' : selectedCandidate.matchScore >= 70 ? 'Strong Match' : selectedCandidate.matchScore > 0 ? 'Review Needed' : 'Evaluation Pending'}
                    </span>
                  </div>

                  <div className={cn("p-5 rounded-2xl border flex flex-col justify-between", theme === 'light' ? "bg-slate-50/80 border-slate-200/60 shadow-sm text-slate-800" : "bg-zinc-800/20 border-white/5 text-white")}>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-3">Interview Overview</span>
                    
                    <div className="grid gap-3.5 text-xs font-semibold text-slate-650 dark:text-gray-300">
                      <div className="flex items-center justify-between border-b border-dashed border-slate-200/60 dark:border-zinc-800 pb-2">
                        <span className="flex items-center gap-1.5"><Clock size={13} className="text-purple-500" /> Time Spent:</span>
                        <span className="font-bold text-slate-850 dark:text-white">{formatTimeSpent(selectedCandidate.metaData?.time_spent)}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-dashed border-slate-200/60 dark:border-zinc-800 pb-2">
                        <span className="flex items-center gap-1.5"><Activity size={13} className="text-purple-500" /> Completion Mode:</span>
                        <span className="font-bold text-slate-855 dark:text-white capitalize">{selectedCandidate.metaData?.exit_type?.toLowerCase() || 'Automatic'}</span>
                      </div>
                      <div className="flex items-center justify-between pb-1">
                        <span className="flex items-center gap-1.5"><Star size={13} className="text-purple-500" /> Candidate Rating:</span>
                        <span className="font-bold text-slate-855 dark:text-white flex items-center gap-0.5">
                          {selectedCandidate.metaData?.rating ? (
                            <>
                              {selectedCandidate.metaData.rating} / 5 <Star size={10} fill="currentColor" className="text-yellow-400" />
                            </>
                          ) : 'No Review'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Brief Performance Report */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <BrainCircuit size={14} className="text-purple-500" />
                    AI Recruitment Insights & Brief Report
                  </span>
                  <div className={cn("p-5 rounded-2xl border text-sm leading-relaxed", theme === 'light' ? "bg-purple-50/30 border-purple-100/80 text-slate-700 shadow-sm" : "bg-purple-950/5 border-purple-900/30 text-gray-300")}>
                    {selectedCandidate.metaData?.feedback ? (
                      <p className="whitespace-pre-line font-medium">{selectedCandidate.metaData.feedback}</p>
                    ) : (
                      <p className="italic text-slate-400 dark:text-zinc-500 text-center py-4">No AI report generated yet. The candidate might still be in progress or completed without recording dialogue tracks.</p>
                    )}
                  </div>
                </div>

                {/* Candidate Feedback Review */}
                {selectedCandidate.metaData?.candidateFeedback && (
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <BookOpen size={14} className="text-purple-500" />
                      Candidate Experience Comments
                    </span>
                    <div className={cn("p-5 rounded-2xl border text-xs leading-relaxed italic", theme === 'light' ? "bg-slate-50 border-slate-200/60 text-slate-650 shadow-sm" : "bg-black/20 border-white/5 text-gray-400")}>
                      "{selectedCandidate.metaData.candidateFeedback}"
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 dark:text-zinc-500 mr-2 font-medium">Candidate Status:</span>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    selectedCandidate.status === 'Accepted' && (theme === 'light' ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-purple-950/40 text-purple-300 border-purple-850/50"),
                    selectedCandidate.status === 'Rejected' && (theme === 'light' ? "bg-zinc-150 text-zinc-650 border-zinc-250" : "bg-zinc-800/40 text-zinc-450 border-zinc-700/50"),
                    selectedCandidate.status === 'COMPLETED' && (theme === 'light' ? "bg-violet-100 text-violet-850 border-violet-200" : "bg-violet-950/40 text-violet-300 border-violet-850/50"),
                    selectedCandidate.status === 'STARTED' && (theme === 'light' ? "bg-indigo-100 text-indigo-850 border-indigo-200" : "bg-indigo-950/40 text-indigo-300 border-indigo-850/50"),
                  )}>
                    {selectedCandidate.status === 'STARTED' ? 'Interviewing' : selectedCandidate.status === 'COMPLETED' ? 'Completed' : selectedCandidate.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 justify-end">
                  <button
                    onClick={handleDownloadPDF}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all shadow-sm",
                      theme === 'light'
                        ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300"
                        : "bg-purple-950/30 text-purple-300 border-purple-900/40 hover:bg-purple-900/40 hover:border-purple-850"
                    )}
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
                  {selectedCandidate.status !== 'Accepted' && selectedCandidate.status !== 'Rejected' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedCandidate.id, 'Rejected')}
                        className={cn(
                          "px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm",
                          theme === 'light'
                            ? "border-zinc-250 bg-white text-zinc-650 hover:bg-zinc-100 hover:border-zinc-350"
                            : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-750 hover:text-white hover:border-zinc-750"
                        )}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedCandidate.id, 'Accepted')}
                        className={cn(
                          "px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm",
                          theme === 'light'
                            ? "border-purple-600 bg-purple-600 text-white hover:bg-purple-700 hover:border-purple-700"
                            : "border-purple-500 bg-purple-500 text-white hover:bg-purple-600 hover:border-purple-600"
                        )}
                      >
                        Accept
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-xs font-bold border transition-all shadow-sm",
                      theme === 'light' ? "bg-zinc-100 hover:bg-zinc-200 border-transparent text-zinc-700" : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
                    )}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
