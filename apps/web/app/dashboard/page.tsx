'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardPage } from '../../components/pages/DashboardPage';

export default function Dashboard() {
  const router = useRouter();

  return (
    <DashboardPage
      onNavigateCreateJob={() => router.push('/dashboard/jobs/new')}
    />
  );
}
