'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { LandingPage } from '../components/pages/LandingPage';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show a premium loading screen while checking authentication or when redirecting
  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0B] text-white">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-650 dark:text-purple-400 mb-2 shadow-lg shadow-purple-500/5">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar
        onNavigateSignup={() => router.push('/signup')}
      />
      <LandingPage />
      <Footer />
    </>
  );
}
