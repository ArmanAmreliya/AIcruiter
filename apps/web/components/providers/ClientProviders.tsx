
'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from '../../lib/apollo-client';
import { ThemeProvider } from '../../context/ThemeContext';
import { DemoProvider } from '../../context/DemoContext';

export const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <DemoProvider>
          {children}
        </DemoProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
};
