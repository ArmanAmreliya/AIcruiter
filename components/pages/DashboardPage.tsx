
import React from 'react';
import { DashboardClient } from '../dashboard/DashboardClient';

export const DashboardPage = () => {
  // In a real Server Component usage (Next.js App Router), you would await getDashboardStats here.
  // Since this is a client-side simulated SPA for this environment:
  const dummyStats = {
    totalCandidates: 1284,
    activeJobs: 12,
    aiCredits: 850,
    timeSavedHours: 48,
  };

  return (
    <DashboardClient initialStats={dummyStats} userName="Alex" />
  );
};
