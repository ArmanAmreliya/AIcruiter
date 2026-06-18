import React from 'react';
import Script from 'next/script';
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
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <Script
          id="runtime-env"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: `
            window.__SUPABASE_URL__ = ${JSON.stringify(process.env.NEXT_SUPABASE_URL || process.env.VITE_SUPABASE_URL)};
            window.__SUPABASE_ANON_KEY__ = ${JSON.stringify(process.env.NEXT_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)};
            window.__NEXT_GROQ_API_KEY__ = ${JSON.stringify(process.env.NEXT_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || process.env.NEXT_AI_API_KEY || process.env.VITE_AI_API_KEY)};
            window.__NEXT_AI_API_KEY__ = ${JSON.stringify(process.env.NEXT_AI_API_KEY || process.env.VITE_AI_API_KEY || process.env.NEXT_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY)};
          ` }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
