
export interface User {
  id: string;
  name: string;
  company: string;
  role: string;
  aiCredits: number;
  email: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'DRAFT' | 'CLOSED';
  candidateCount: number;
  location: string;
  createdAt: string;
}

export interface Activity {
  id: string | number;
  type: 'INTERVIEW' | 'APPLICATION' | 'AI' | 'SYSTEM';
  message: string;
  subtitle?: string;
  timestamp: string;
  score?: number;
  avatarUrl?: string;
}

export interface DashboardStats {
  totalCandidates: number;
  activeJobs: number;
  aiCredits: number;
  timeSavedHours: number;
}
