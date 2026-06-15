'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LoginPage } from '../../components/pages/LoginPage';
import { checkOnboardingStatus } from '../actions/onboarding';

export default function Login() {
  const router = useRouter();

  const handleLoginSuccess = async (email?: string) => {
    const emailToCheck = email || 'demo@example.com';
    const isOnboarded = await checkOnboardingStatus(emailToCheck);

    if (isOnboarded) {
      router.push('/dashboard');
    } else {
      router.push(`/onboarding?email=${encodeURIComponent(emailToCheck)}`);
    }
  };

  return (
    <LoginPage
      onBack={() => router.push('/')}
      onNavigateSignup={() => router.push('/signup')}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}
