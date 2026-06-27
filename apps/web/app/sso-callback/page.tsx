'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2, AlertCircle, ArrowLeft, LayoutDashboard } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../lib/utils";
import Link from 'next/link';
import { motion } from 'framer-motion';

function SSOCallbackContent() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();

  const [showTroubleLink, setShowTroubleLink] = useState(false);

  // Check for common OAuth error query parameters
  const error = searchParams?.get('error') || searchParams?.get('error_code');
  const errorDescription = searchParams?.get('error_description') || searchParams?.get('message');

  // Trigger a timeout to show troubleshooting options if redirect takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTroubleLink(true);
    }, 8000); // 8 seconds timeout
    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className={cn(
        "min-h-screen w-full flex flex-col items-center justify-center font-sans transition-colors duration-500 p-6",
        theme === 'light' ? "bg-slate-50 text-slate-900" : "bg-[#0A0A0B] text-white"
      )}>
        {/* Ambient Background Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
        
        <div className={cn(
          "relative z-10 w-full max-w-md rounded-3xl p-8 border shadow-2xl backdrop-blur-md text-center space-y-6",
          theme === 'light' ? "bg-white border-slate-200" : "bg-zinc-900 border-white/10"
        )}>
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-650 dark:text-red-400 mx-auto mb-2">
            <AlertCircle size={32} />
          </div>

          <h3 className="text-xl font-bold tracking-tight">Authentication Failed</h3>
          <p className="text-sm opacity-65 leading-relaxed">
            {errorDescription || "An error occurred during the secure single sign-on process. Please try again."}
          </p>

          <div className="text-[10px] font-mono px-3 py-2 bg-black/5 dark:bg-white/5 rounded-lg opacity-50 truncate">
            Code: {error}
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft size={16} />
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen w-full flex flex-col items-center justify-center font-sans transition-colors duration-500 p-6",
      theme === 'light' ? "bg-slate-50 text-slate-900" : "bg-[#0A0A0B] text-white"
    )}>
      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center max-w-md">
        {/* Animated Brand Logo Container */}
        <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2 shadow-xl shadow-purple-500/5 relative overflow-hidden">
          <Loader2 className="animate-spin" size={36} />
        </div>

        <h3 className="text-2xl font-bold tracking-tight">Securing Session</h3>
        <p className="text-sm opacity-65 leading-relaxed max-w-sm">
          Please wait while we exchange secure credentials and redirect you to the dashboard.
        </p>

        {showTroubleLink && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-850 dark:text-amber-300 space-y-3.5 max-w-xs"
          >
            <p className="font-semibold text-center">Taking longer than usual to redirect?</p>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-purple-650 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <LayoutDashboard size={14} /> Go to Dashboard
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 bg-white/10 hover:bg-white/15 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl font-bold transition-colors block text-center"
              >
                Back to Login
              </Link>
            </div>
          </motion.div>
        )}

        {/* Clerk Captcha anchor container */}
        <div id="clerk-captcha" className="mt-4" />
      </div>

      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
        continueSignUpUrl="/onboarding"
      />
    </div>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0B] text-white">
        <Loader2 className="animate-spin text-purple-650" size={36} />
      </div>
    }>
      <SSOCallbackContent />
    </Suspense>
  );
}
