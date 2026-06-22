'use client';

import React, { Suspense } from 'react';
import { CandidatesPage } from '../../../components/pages/CandidatesPage';
import { PageLoader } from '../../../components/ui/PageLoader';

export default function Candidates() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CandidatesPage />
    </Suspense>
  );
}
