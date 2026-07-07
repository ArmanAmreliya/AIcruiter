import React from 'react';
import Script from 'next/script';
import { ClerkProvider } from '@clerk/nextjs';
import { ClientProviders } from '../components/providers/ClientProviders';
import '../index.css';

export const metadata = {
  title: 'AIcruiter - The AI Assistant for Recruitment',
  description: 'AI Interview screening assistant for modern recruiters.',
  icons: {
    icon: 'https://img.icons8.com/forma-thin/96/7950F2/bot.png',
    shortcut: 'https://img.icons8.com/forma-thin/96/7950F2/bot.png',
    apple: 'https://img.icons8.com/forma-thin/96/7950F2/bot.png',
  },
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
        <link rel="icon" type="image/png" href="https://img.icons8.com/forma-thin/96/7950F2/bot.png" />
        <link rel="shortcut icon" href="https://img.icons8.com/forma-thin/96/7950F2/bot.png" />
        <link rel="apple-touch-icon" href="https://img.icons8.com/forma-thin/96/7950F2/bot.png" />
        {/* Inline env vars as a plain <script> to avoid next/script beforeInteractive chunk issues */}
        <script
          id="runtime-env"
          dangerouslySetInnerHTML={{ __html: `
            window.__SUPABASE_URL__ = ${JSON.stringify(process.env.NEXT_SUPABASE_URL || process.env.VITE_SUPABASE_URL)};
            window.__SUPABASE_ANON_KEY__ = ${JSON.stringify(process.env.NEXT_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)};
            window.__NEXT_GROQ_API_KEY__ = ${JSON.stringify(process.env.NEXT_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || process.env.NEXT_AI_API_KEY || process.env.VITE_AI_API_KEY)};
            window.__NEXT_AI_API_KEY__ = ${JSON.stringify(process.env.NEXT_AI_API_KEY || process.env.VITE_AI_API_KEY || process.env.NEXT_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY)};
          ` }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
        {/* @ts-expect-error Server Component */}
        <ClerkProvider>
          <ClientProviders>
            {children}
          </ClientProviders>
        </ClerkProvider>

        {/* Google Analytics Tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NGK5STZQ24"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NGK5STZQ24');
          `}
        </Script>
      </body>
    </html>
  );
}
