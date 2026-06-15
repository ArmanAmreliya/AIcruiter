'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SignupPage } from '../../components/pages/SignupPage';

export default function Signup() {
  const router = useRouter();

  return (
    <SignupPage
      onBack={() => router.push('/')}
      onNavigateLogin={() => router.push('/login')}
    />
  );
}
