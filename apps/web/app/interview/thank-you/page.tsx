'use client';

import React, { Suspense } from 'react';
import { ThankYouPage } from '../../../components/interview/ThankYouPage';
import { Loader2 } from 'lucide-react';

function ThankYouPageInner() {
  return <ThankYouPage />;
}

export default function InterviewThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-purple-600 mb-4" size={32} />
        <p className="text-sm opacity-50">Loading...</p>
      </div>
    }>
      <ThankYouPageInner />
    </Suspense>
  );
}
