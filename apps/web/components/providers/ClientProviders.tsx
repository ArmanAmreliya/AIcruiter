
'use client';

import React from 'react';
import { ThemeProvider } from '../../context/ThemeContext';
import { DemoProvider } from '../../context/DemoContext';

export const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <DemoProvider>
        {children}
      </DemoProvider>
    </ThemeProvider>
  );
};
