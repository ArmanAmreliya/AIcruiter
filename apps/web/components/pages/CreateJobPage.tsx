import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2, ArrowRight, Check, Copy, LayoutDashboard, Clock, Tag, Briefcase, FileText, User, Award, Brain, BookOpen, ListChecks } from 'lucide-react';
import { useAiCruiter } from '../../hooks/use-aicruiter';
import { useTheme } from '../../context/ThemeContext';
import { useSearchParams } from 'next/navigation';
import { cn, parseJobDescription, serializeJobDescription } from '../../lib/utils';
import { toast } from 'sonner';

interface CreateJobPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const INTERVIEW_TYPES = [
  { id: 'Technical', icon: '< / >', label: 'Technical' },
  { id: 'Behavioral', icon: '👤', label: 'Behavioral' },
  { id: 'Experience', icon: '💼', label: 'Experience' },
  { id: 'Problem Solving', icon: '🧩', label: 'Problem Solving' },
  { id: 'Leadership', icon: '👥', label: 'Leadership' }
];

const DURATIONS = [15, 30, 45, 60];

const EXPERIENCE_LEVELS = [
  { id: 'Entry-Level', label: 'Entry-Level', desc: 'Fundamentals, basic syntax, coding principles' },
  { id: 'Mid-Level', label: 'Mid-Level', desc: 'Application building, design patterns, testing' },
  { id: 'Senior', label: 'Senior', desc: 'Architecture, high scaling, complex tradeoffs' },
  { id: 'Lead', label: 'Lead', desc: 'System design, engineering leadership, strategy' }
];

const PERSONAS = [
  { id: 'Sarah', name: 'Sarah', role: 'Talent Acquisition', desc: 'Warm & Encouraging', tone: 'Conversational fillers, lower stress, friendly guidance' },
  { id: 'David', name: 'David', role: 'Tech Lead Interviewer', desc: 'Technical & Rigorous', tone: 'Deep architecture questions, tradeoff analysis, testing edge cases' },
  { id: 'Emma', name: 'Emma', role: 'Product Talent Partner', desc: 'Fast-paced & Conversational', tone: 'Collaborative agility, speed, communication, outcomes focus' }
];

const SUGGESTED_SKILLS = ['React', 'System Design', 'TypeScript', 'Node.js', 'SQL', 'Algorithms', 'Testing', 'Behavioral', 'Communication', 'AWS'];

export const CreateJobPage = ({ onBack, onSuccess }: CreateJobPageProps) => {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const { createJob, updateJob, fetchJobById } = useAiCruiter();

  // URL Params for Edit Mode
  const editId = searchParams?.get('edit') ?? null;
  const isEditMode = !!editId;

  // Form State
  const [jobPosition, setJobPosition] = useState('');
  const [description, setDescription] = useState('');
  const [durationValue, setDurationValue] = useState(15);
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');
  const duration = durationUnit === 'hours' ? durationValue * 60 : durationValue;
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Technical']);
  
  // Custom Interview settings
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level');
  const [guidelines, setGuidelines] = useState('');
  const [focusAreas, setFocusAreas] = useState('');
  const [persona, setPersona] = useState('Sarah');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(isEditMode);

  // Load existing data if in edit mode
  React.useEffect(() => {
    if (isEditMode && editId) {
      const loadJob = async () => {
        const job = await fetchJobById(editId);
        if (job) {
          setJobPosition(job.title);
          
          // Parse metadata out of description
          const parsedMeta = parseJobDescription(job.description);
          setDescription(parsedMeta.description);
          setGuidelines(parsedMeta.guidelines);
          setFocusAreas(parsedMeta.focusAreas);
          setPersona(parsedMeta.persona);

          const mins = job.durationMinutes || job.duration_minutes || 15;
          if (mins >= 60 && mins % 60 === 0) {
            setDurationValue(mins / 60);
            setDurationUnit('hours');
          } else {
            setDurationValue(mins);
            setDurationUnit('minutes');
          }
          setSelectedTypes(job.interviewType || job.interview_type || ['Technical']);
          setExperienceLevel(job.experienceLevel || 'Mid-Level');
        }
        setIsInitialLoading(false);
      };
      loadJob();
    }
  }, [isEditMode, editId, fetchJobById]);

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleAddSkill = (skill: string) => {
    setFocusAreas(prev => {
      const currentSkills = prev ? prev.split(',').map(s => s.trim()) : [];
      if (currentSkills.includes(skill)) {
        return currentSkills.filter(s => s !== skill).join(', ');
      } else {
        return [...currentSkills, skill].filter(Boolean).join(', ');
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobPosition || !description) {
      toast.error("Please fill in the job position and description.");
      return;
    }
    if (selectedTypes.length === 0) {
      toast.error("Please select at least one interview type.");
      return;
    }

    const serializedDescription = serializeJobDescription({
      description,
      guidelines,
      focusAreas,
      persona
    });

    setIsSubmitting(true);
    try {
      if (isEditMode && editId) {
        await updateJob(editId, {
          title: jobPosition,
          job_role: jobPosition, // Ensure role tracks title
          description: serializedDescription,
          duration_minutes: duration,
          interview_type: selectedTypes,
          experienceLevel
        });
        toast.success("Interview updated successfully!");
        onSuccess();
      } else {
        const newJob = await createJob(jobPosition, serializedDescription, duration, selectedTypes, experienceLevel);
        if (newJob) {
          setCreatedJobId(newJob.id);
          toast.success("AI Agent Deployed! Job created successfully.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(isEditMode ? "Failed to update job" : "Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdJobId) return;
    const link = `${window.location.origin}/interview/${createdJobId}`;
    navigator.clipboard.writeText(link);
    toast.success("Candidate link copied!");
  };

  const handleCreateAnother = () => {
    setCreatedJobId(null);
    setJobPosition('');
    setDescription('');
    setSelectedTypes(['Technical']);
    setDurationValue(15);
    setDurationUnit('minutes');
    setExperienceLevel('Mid-Level');
    setGuidelines('');
    setFocusAreas('');
    setPersona('Sarah');
  };

  // --- SUCCESS STATE ---
  if (createdJobId) {
    return (
      <div className="max-w-xl mx-auto pt-10 text-center font-sans">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "rounded-3xl p-10 border shadow-2xl relative overflow-hidden",
            theme === 'light' ? "bg-white border-gray-100" : "bg-zinc-900 border-white/10"
          )}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-purple-500/40 shadow-xl"
          >
            <Check size={40} strokeWidth={4} />
          </motion.div>

          <h2 className={cn("text-2xl font-bold mb-2", theme === 'light' ? "text-gray-900" : "text-white")}>
            Your AI Interview is Ready!
          </h2>
          <p className={cn("text-base mb-8", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
            Share this link with candidates to start the interview process for <span className="font-semibold text-purple-600">{jobPosition}</span>.
          </p>

          <div className={cn(
            "flex items-center gap-3 p-4 rounded-xl border mb-8 text-left",
            theme === 'light' ? "bg-gray-50 border-gray-200" : "bg-black/30 border-white/10"
          )}>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Interview Link</div>
              <div className={cn("font-mono text-sm truncate", theme === 'light' ? "text-black" : "text-white")}>
                {window.location.origin}/interview/{createdJobId}
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-purple-600/20"
            >
              <Copy size={16} /> Copy
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onSuccess}
              className={cn(
                "w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border",
                theme === 'light' ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-50" : "bg-transparent border-white/10 text-white hover:bg-white/5"
              )}
            >
              <LayoutDashboard size={18} />
              Back to Dashboard
            </button>
            <button
              onClick={handleCreateAnother}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-600/20"
            >
              + Create New Interview
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- FORM STATE ---
  return (
    <div className="max-w-3xl mx-auto pt-4 font-sans pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className={cn(
            "p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors",
            theme === 'light' ? "text-gray-600" : "text-gray-300"
          )}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className={cn("text-2xl font-bold", theme === 'light' ? "text-gray-900" : "text-white")}>
          {isEditMode ? 'Edit Interview' : 'Create New Interview'}
        </h1>
      </div>

      {isInitialLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-600 mb-4" size={32} />
          <p className="text-sm opacity-50">Fetching interview details...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-2xl p-8 border shadow-sm",
            theme === 'light' ? "bg-white border-gray-200" : "bg-zinc-900 border-zinc-800"
          )}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Job Position */}
            <div className="space-y-2">
              <label className={cn("text-sm font-semibold flex items-center gap-2", theme === 'light' ? "text-gray-700" : "text-gray-300")}>
                <Briefcase size={16} className="text-purple-500" />
                Job Position
              </label>
              <input
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border outline-none transition-all text-base",
                  theme === 'light'
                    ? "bg-white border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 text-gray-900 placeholder:text-gray-400"
                    : "bg-black/40 border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder:text-zinc-650"
                )}
                disabled={isSubmitting}
              />
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label className={cn("text-sm font-semibold flex items-center gap-2", theme === 'light' ? "text-gray-700" : "text-gray-300")}>
                <FileText size={16} className="text-purple-500" />
                Job Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter detailed job description, responsibilities, and requirements..."
                rows={5}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border outline-none transition-all text-base resize-none",
                  theme === 'light'
                    ? "bg-white border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 text-gray-900 placeholder:text-gray-400"
                    : "bg-black/40 border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder:text-zinc-650"
                )}
                disabled={isSubmitting}
              />
            </div>

            {/* Target Experience Level */}
            <div className="space-y-3">
              <label className={cn("text-sm font-semibold flex items-center gap-2", theme === 'light' ? "text-gray-700" : "text-gray-300")}>
                <Award size={16} className="text-purple-500" />
                Target Experience Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPERIENCE_LEVELS.map((level) => {
                  const isSelected = experienceLevel === level.id;
                  return (
                    <div
                      key={level.id}
                      onClick={() => !isSubmitting && setExperienceLevel(level.id)}
                      className={cn(
                        "p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.01] duration-200",
                        isSelected
                          ? theme === 'light'
                            ? "bg-purple-50 border-purple-300 text-purple-950 ring-2 ring-purple-100"
                            : "bg-purple-950/20 border-purple-500 text-white ring-1 ring-purple-500"
                          : theme === 'light'
                            ? "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                            : "bg-black/20 border-zinc-700 hover:bg-white/5 text-gray-300"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">{level.label}</span>
                          <div className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center",
                            isSelected ? "border-purple-500 bg-purple-500 text-white" : "border-gray-300 dark:border-zinc-650"
                          )}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className={cn("text-xs leading-relaxed", isSelected ? (theme === 'light' ? "text-purple-800" : "text-purple-200") : "text-gray-400")}>
                          {level.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Recruiter Persona */}
            <div className="space-y-3">
              <label className={cn("text-sm font-semibold flex items-center gap-2", theme === 'light' ? "text-gray-700" : "text-gray-300")}>
                <Brain size={16} className="text-purple-500" />
                AI Recruiter Persona
              </label>
              <div className="grid grid-cols-1 gap-3">
                {PERSONAS.map((p) => {
                  const isSelected = persona === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => !isSubmitting && setPersona(p.id)}
                      className={cn(
                        "p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 hover:scale-[1.005] duration-200",
                        isSelected
                          ? theme === 'light'
                            ? "bg-purple-50/80 border-purple-300 text-purple-950 ring-2 ring-purple-100"
                            : "bg-purple-950/25 border-purple-500 text-white ring-1 ring-purple-500"
                          : theme === 'light'
                            ? "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                            : "bg-black/20 border-zinc-700 hover:bg-white/5 text-gray-300"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold",
                        isSelected ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700 dark:bg-zinc-800 dark:text-purple-400"
                      )}>
                        {p.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm mr-2">{p.name}</span>
                            <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">{p.role}</span>
                          </div>
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", isSelected ? "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-800" : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-750")}>
                            {p.desc}
                          </span>
                        </div>
                        <p className={cn("text-xs mt-1 leading-relaxed", isSelected ? (theme === 'light' ? "text-purple-800" : "text-purple-200") : "text-gray-400")}>
                          <span className="font-semibold">Style:</span> {p.tone}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Core Focus Skills */}
            <div className="space-y-3">
              <label className={cn("text-sm font-semibold flex items-center gap-2", theme === 'light' ? "text-gray-700" : "text-gray-300")}>
                <Tag size={16} className="text-purple-500" />
                Technical & Skill Focus
              </label>
              <input
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                placeholder="e.g. React, Redux, Performance, System Design"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border outline-none transition-all text-base",
                  theme === 'light'
                    ? "bg-white border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 text-gray-900 placeholder:text-gray-400"
                    : "bg-black/40 border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder:text-zinc-650"
                )}
                disabled={isSubmitting}
              />
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider">Quick Suggestions:</span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS.map((skill) => {
                    const isAdded = focusAreas.toLowerCase().includes(skill.toLowerCase());
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleAddSkill(skill)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all hover:scale-[1.03]",
                          isAdded
                            ? "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-350"
                            : theme === 'light'
                              ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                              : "bg-black/20 border-zinc-800 text-zinc-400 hover:bg-white/5"
                        )}
                      >
                        {isAdded ? `✓ ${skill}` : `+ ${skill}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Custom Guidelines */}
            <div className="space-y-2">
              <label className={cn("text-sm font-semibold flex items-center gap-2", theme === 'light' ? "text-gray-700" : "text-gray-300")}>
                <BookOpen size={16} className="text-purple-500" />
                Custom Interviewer Guidelines
              </label>
              <textarea
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                placeholder="Specific guidance for the AI recruiter (e.g. 'Ensure they walk through their thinking step-by-step', 'Focus on scalability and system tradeoffs', 'Do not provide coding solutions if they get stuck')"
                rows={3}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border outline-none transition-all text-base resize-none",
                  theme === 'light'
                    ? "bg-white border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 text-gray-900 placeholder:text-gray-400"
                    : "bg-black/40 border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder:text-zinc-650"
                )}
                disabled={isSubmitting}
              />
            </div>

            {/* Duration & Visual Timeline */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className={cn("text-sm font-semibold flex items-center gap-2", theme === 'light' ? "text-gray-700" : "text-gray-300")}>
                  <Clock size={16} className="text-purple-500" />
                  Interview Duration
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      min={1}
                      value={durationValue}
                      onChange={(e) => setDurationValue(Math.max(1, Number(e.target.value)))}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border outline-none transition-all text-base",
                        theme === 'light'
                          ? "bg-white border-gray-200 focus:border-purple-500 text-gray-900"
                          : "bg-black/40 border-zinc-700 focus:border-purple-500 text-white"
                      )}
                      placeholder="Duration"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="w-[150px] relative">
                    <select
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value as 'minutes' | 'hours')}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border outline-none transition-all text-base appearance-none cursor-pointer pr-10",
                        theme === 'light'
                          ? "bg-white border-gray-200 focus:border-purple-500 text-gray-900"
                          : "bg-black/40 border-zinc-700 focus:border-purple-500 text-white"
                      )}
                      disabled={isSubmitting}
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                      <Clock size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Breakdown Timeline */}
              {(() => {
                const durationSeconds = duration * 60;
                const formatTime = (secs: number) => {
                  const mins = Math.floor(secs / 60);
                  const s = Math.floor(secs % 60);
                  return `${mins}:${s < 10 ? '0' : ''}${s}`;
                };

                let coreStartSec = 180;
                let coreEndSec = durationSeconds - 180;

                if (duration < 5) {
                  coreStartSec = Math.round(durationSeconds * 0.25);
                  coreEndSec = Math.round(durationSeconds * 0.75);
                } else if (duration < 10) {
                  coreStartSec = 60;
                  coreEndSec = durationSeconds - 60;
                }

                return (
                  <div className={cn(
                    "p-4 rounded-xl border text-xs space-y-3",
                    theme === 'light' ? "bg-purple-50/20 border-purple-100 text-gray-600" : "bg-black/20 border-zinc-800 text-zinc-400"
                  )}>
                    <div className="font-bold flex items-center gap-2 text-purple-700 dark:text-purple-300">
                      <ListChecks size={14} />
                      Interview Session Timeline Breakdown ({duration} {duration === 1 ? 'minute' : 'minutes'})
                    </div>
                    <div className="relative pl-4 border-l border-purple-200 dark:border-purple-900/50 space-y-3">
                      <div className="relative">
                        <div className="absolute -left-[20.5px] top-0.5 w-2 h-2 rounded-full bg-purple-500" />
                        <span className="font-bold text-gray-800 dark:text-gray-300">Start (0:00 - {formatTime(coreStartSec)}):</span> Introduction by {persona}, Candidate icebreaker, and verification.
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[20.5px] top-0.5 w-2 h-2 rounded-full bg-purple-500" />
                        <span className="font-bold text-gray-800 dark:text-gray-300">Core Assessment ({formatTime(coreStartSec)} - {formatTime(coreEndSec)}):</span> Screening on key skills ({focusAreas || 'relevant job skills'}) adapted to {experienceLevel} seniority.
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[20.5px] top-0.5 w-2 h-2 rounded-full bg-purple-500" />
                        <span className="font-bold text-gray-800 dark:text-gray-300">Wrap-up ({formatTime(coreEndSec)} - {formatTime(durationSeconds)}):</span> Candidate Q&A, feedback registration, and session closing.
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Interview Types (Chips) */}
            <div className="space-y-3">
              <label className={cn("text-sm font-semibold flex items-center gap-2", theme === 'light' ? "text-gray-700" : "text-gray-300")}>
                <Sparkles size={16} className="text-purple-500" />
                Interview Types
              </label>
              <div className="flex flex-wrap gap-3">
                {INTERVIEW_TYPES.map((type) => {
                  const isSelected = selectedTypes.includes(type.id);
                  return (
                    <motion.button
                      key={type.id}
                      type="button"
                      onClick={() => toggleType(type.id)}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 transition-all",
                        isSelected
                          ? theme === 'light'
                            ? "bg-purple-50 border-purple-200 text-purple-700 ring-2 ring-purple-100"
                            : "bg-purple-950/30 border-purple-500 text-purple-300 ring-1 ring-purple-500"
                          : (theme === 'light' ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-black/20 border-zinc-700 text-gray-300 hover:bg-white/5")
                      )}
                    >
                      <span className={isSelected ? "opacity-100" : "opacity-70"}>{type.id === 'Technical' ? '</>' : type.icon}</span>
                      {type.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* AI Generation Message (Only when submitting) */}
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-850 rounded-xl p-4 flex gap-3 text-purple-800 dark:text-purple-200"
              >
                <Loader2 className="animate-spin shrink-0 text-purple-600" size={20} />
                <div>
                  <h4 className="font-bold text-sm">Deploying AI Interview Agent</h4>
                  <p className="text-xs mt-1 opacity-80">Our engine is configuring {persona} to conduct a professional {experienceLevel} interview...</p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={onBack}
                className={cn(
                  "px-6 py-3 rounded-xl font-semibold text-sm transition-colors",
                  theme === 'light' ? "text-gray-500 hover:bg-gray-100" : "text-gray-400 hover:bg-white/5"
                )}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deploying...' : (isEditMode ? 'Update Interview' : 'Deploy AI Recruiter')}
                {!isSubmitting && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};