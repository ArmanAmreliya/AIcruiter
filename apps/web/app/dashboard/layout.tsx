'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export default function NextDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <DashboardLayout
      onLogout={() => router.push('/')}
      onCreateJob={() => router.push('/dashboard/jobs/new')}
    >
      {children}
    </DashboardLayout>
  );
}
