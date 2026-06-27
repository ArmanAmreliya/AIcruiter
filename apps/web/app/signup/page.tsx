'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SignupPage } from '../../components/pages/SignupPage';
import { Loader2 } from 'lucide-react';

export default function Signup() {
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

  return (
    <SignupPage
      onBack={() => router.push('/')}
      onNavigateLogin={() => router.push('/login')}
    />
  );
}
