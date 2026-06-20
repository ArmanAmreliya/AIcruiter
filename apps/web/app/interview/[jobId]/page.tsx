'use client';

import React, { Suspense } from 'react';
import { InterviewLobby } from '../../../components/interview/InterviewLobby';
import { Loader2 } from 'lucide-react';

function InterviewLobbyInner() {
  return <InterviewLobby />;
}

export default function InterviewLobbyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <Loader2 className="animate-spin text-purple-600 mb-4" size={32} />
        <p className="text-sm text-gray-400">Loading interview...</p>
      </div>
    }>
      <InterviewLobbyInner />
    </Suspense>
  );
}
