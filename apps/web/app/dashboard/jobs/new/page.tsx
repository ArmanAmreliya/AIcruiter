'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { CreateJobPage as CreateJobForm } from '../../../../components/pages/CreateJobPage';
import { Loader2 } from 'lucide-react';

function CreateJobPageInner() {
  const router = useRouter();
  return (
    <CreateJobForm
      onBack={() => router.push('/dashboard/interviews')}
      onSuccess={() => router.push('/dashboard/interviews')}
    />
  );
}

export default function CreateJobPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-purple-600 mb-4" size={32} />
        <p className="text-sm opacity-50">Loading form...</p>
      </div>
    }>
      <CreateJobPageInner />
    </Suspense>
  );
}
