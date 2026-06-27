'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { LoginPage } from '../../components/pages/LoginPage';
import { checkOnboardingStatus } from '../actions/onboarding';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-black">
        <Loader2 className="animate-spin text-purple-655" size={32} />
      </div>
    );
  }

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
