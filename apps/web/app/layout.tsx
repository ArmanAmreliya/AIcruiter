import React from 'react';
import { ClientProviders } from '../components/providers/ClientProviders';
import '../index.css';

export const metadata = {
  title: 'AIcruiter - The AI Assistant for Recruitment',
  description: 'AI Interview screening assistant for modern recruiters.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
