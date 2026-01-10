
import React from 'react';
import { DashboardClient } from '../dashboard/DashboardClient';

interface DashboardPageProps {
  onNavigateCreateJob: () => void;
}

export const DashboardPage = ({ onNavigateCreateJob }: DashboardPageProps) => {
  return (
    <DashboardClient onNavigateCreateJob={onNavigateCreateJob} />
  );
};
