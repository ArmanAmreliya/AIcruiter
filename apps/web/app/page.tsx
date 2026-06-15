'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '../components/pages/LandingPage';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Navbar
        onNavigateLogin={() => router.push('/login')}
        onNavigateSignup={() => router.push('/signup')}
      />
      <LandingPage />
      <Footer />
    </>
  );
}
