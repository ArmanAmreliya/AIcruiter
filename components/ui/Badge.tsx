
import React, { ReactNode } from 'react';

export const Badge = ({ children }: { children?: ReactNode }) => (
  <div className="inline-flex items-center px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in-up">
    <span className="w-2 h-2 rounded-full bg-purple-600 mr-2 animate-pulse"></span>
    {children}
  </div>
);
