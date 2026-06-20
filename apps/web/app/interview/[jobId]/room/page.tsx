'use client';

import React, { Suspense } from 'react';
import { InterviewRoom } from '../../../../components/interview/InterviewRoom';
import { Loader2 } from 'lucide-react';

function InterviewRoomInner() {
  return <InterviewRoom />;
}

export default function InterviewRoomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <Loader2 className="animate-spin text-purple-600 mb-4" size={32} />
        <p className="text-sm text-gray-400">Preparing interview room...</p>
      </div>
    }>
      <InterviewRoomInner />
    </Suspense>
  );
}
