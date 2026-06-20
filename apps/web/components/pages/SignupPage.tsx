
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Loader2, ArrowLeft, Star, Quote } from 'lucide-react';
import { useSignUp } from '@clerk/nextjs/legacy';
import { LoadingLogo } from '../ui/LoadingLogo';
import { cn } from '../../lib/utils';

// --- Zod Schema ---
const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupPageProps {
  onBack: () => void;
  onNavigateLogin: () => void;
}

export const SignupPage = ({ onBack, onNavigateLogin }: SignupPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, isLoaded, setActive } = useSignUp();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pendingVerification && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pendingVerification, resendTimer]);

  const handleResendCode = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setResendTimer(60);
      toast.success("Verification code resent successfully!");
    } catch (error: any) {
      toast.error(error.message || error.errors?.[0]?.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.fullName.split(' ')[0] || data.fullName,
        lastName: data.fullName.split(' ').slice(1).join(' ') || '',
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
      setResendTimer(60);
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      toast.error(error.message || error.errors?.[0]?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code.");
      return;
    }
    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        toast.success("Account created successfully!");
        window.location.href = '/dashboard';
      } else {
        throw new Error("Verification incomplete. Please check the code.");
      }
    } catch (error: any) {
      toast.error(error.message || error.errors?.[0]?.message || "Failed to verify email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: 'oauth_google' | 'oauth_microsoft' | 'oauth_linkedin_oidc') => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (error: any) {
      toast.error(error.message || error.errors?.[0]?.message || `Could not sign up with ${provider}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      <Toaster position="top-center" richColors />

      {/* Left Column: Visual (Desktop Only) - REVERSED LAYOUT */}
      <div className="hidden lg:flex w-1/2 bg-black relative flex-col items-center justify-center p-12 overflow-hidden text-center">
        <div className="absolute inset-0 bg-purple-grid opacity-30" />

        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[100px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-900/20 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative z-10 max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
        >
          <Quote className="text-purple-500 mb-6 w-8 h-8 opacity-80" />
          <h2 className="text-3xl font-bold text-white tracking-tight leading-tight mb-8 font-serif italic">
            "AIcruiter cut our screening time by <span className="text-[#A78BFA]">70%</span> within the first month."
          </h2>

          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-white/20">
              HR
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-sm">Sarah Jenkins</div>
              <div className="text-gray-400 text-xs uppercase tracking-wider">Head of HR, TechFlow</div>
            </div>
            <div className="ml-auto flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={14} className="fill-[#A78BFA] text-[#A78BFA]" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Form - REVERSED LAYOUT */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 relative bg-white">
        <motion.button
          onClick={onBack}
          whileHover={{ x: -4 }}
          className="absolute top-8 left-8 text-black flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <LoadingLogo size={40} loading={false} />
            <span className="text-xl font-bold tracking-tight text-black">AIcruiter</span>
          </div>

          <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">Create your recruiter account</h1>
          <p className="text-[#6D28D9] font-medium mb-8">Start hiring smarter today.</p>

          {!pendingVerification ? (
            <>
              <div className="grid grid-cols-3 gap-3 mb-8">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOAuthSignup('oauth_google')}
                  disabled={isLoading}
                  type="button"
                  className="bg-white border border-gray-200 text-black h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title="Sign up with Google"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOAuthSignup('oauth_microsoft')}
                  disabled={isLoading}
                  type="button"
                  className="bg-white border border-gray-200 text-black h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title="Sign up with Microsoft"
                >
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <rect x="0" y="0" width="11" height="11" fill="#F25022"/>
                    <rect x="12" y="0" width="11" height="11" fill="#7FBA00"/>
                    <rect x="0" y="12" width="11" height="11" fill="#00A4EF"/>
                    <rect x="12" y="12" width="11" height="11" fill="#FFB900"/>
                  </svg>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOAuthSignup('oauth_linkedin_oidc')}
                  disabled={isLoading}
                  type="button"
                  className="bg-white border border-gray-200 text-black h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title="Sign up with LinkedIn"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#0A66C2" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </motion.button>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">Or sign up with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Full Name</label>
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="Jane Doe"
                    className={cn(
                      "w-full px-4 py-3 rounded-2xl border bg-white text-black outline-none transition-all focus:ring-2",
                      errors.fullName
                        ? "border-purple-600 focus:ring-purple-600/20"
                        : "border-black focus:ring-purple-600/20"
                    )}
                    disabled={isLoading}
                  />
                  {errors.fullName && (
                    <p className="text-xs font-medium text-[#6D28D9]">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="name@company.com"
                    className={cn(
                      "w-full px-4 py-3 rounded-2xl border bg-white text-black outline-none transition-all focus:ring-2",
                      errors.email
                        ? "border-purple-600 focus:ring-purple-600/20"
                        : "border-black focus:ring-purple-600/20"
                    )}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-xs font-medium text-[#6D28D9]">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Password</label>
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className={cn(
                      "w-full px-4 py-3 rounded-2xl border bg-white text-black outline-none transition-all focus:ring-2",
                      errors.password
                        ? "border-purple-600 focus:ring-purple-600/20"
                        : "border-black focus:ring-purple-600/20"
                    )}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-xs font-medium text-[#6D28D9]">{errors.password.message}</p>
                  )}
                </div>

                <div id="clerk-captcha" />

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white h-12 rounded-full font-medium text-sm flex items-center justify-center hover:bg-zinc-800 transition-colors disabled:opacity-50 mt-4 gap-2"
                >
                  {isLoading ? <LoadingLogo size={24} className="text-white" /> : "Create Account"}
                </motion.button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">We've sent a 6-digit verification code to your email. Enter it below to complete registration.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Verification Code</label>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-black bg-white text-black text-center text-lg font-bold tracking-widest outline-none transition-all focus:ring-2 focus:ring-purple-600/20"
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-between items-center text-sm px-1">
                <span className="text-gray-500">Didn't receive the code?</span>
                {resendTimer > 0 ? (
                  <span className="text-[#6D28D9] font-medium">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-black font-semibold hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white h-12 rounded-full font-medium text-sm flex items-center justify-center hover:bg-zinc-800 transition-colors disabled:opacity-50 mt-4 gap-2"
              >
                {isLoading ? <LoadingLogo size={24} className="text-white" /> : "Verify & Complete Signup"}
              </motion.button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account? <button onClick={onNavigateLogin} className="text-black font-medium underline underline-offset-4 hover:text-purple-600 transition-colors">Log in</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
