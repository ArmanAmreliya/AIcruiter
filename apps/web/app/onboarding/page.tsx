'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OnboardingPage } from '../../components/pages/OnboardingPage';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'demo@example.com';

  return (
    <OnboardingPage
      userEmail={email}
      onComplete={() => router.push('/dashboard')}
    />
  );
}

export default function Onboarding() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-500">Loading onboarding...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
