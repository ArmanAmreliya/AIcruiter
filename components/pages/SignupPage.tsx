
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Loader2, ArrowLeft, Star, Quote } from 'lucide-react';
import { supabase } from '../../lib/supabase';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) throw error;

      toast.success("Account created! Check your email to verify.");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Could not sign up with Google");
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
                  {[1,2,3,4,5].map(i => (
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
            <img width="48" height="48" src="https://img.icons8.com/forma-thin/96/7950F2/bot.png" alt="Logo" className="w-10 h-10"/>
            <span className="text-xl font-bold tracking-tight text-black">AIcruiter</span>
          </div>

          <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">Create your recruiter account</h1>
          <p className="text-[#6D28D9] font-medium mb-8">Start hiring smarter today.</p>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full bg-white border border-black text-black h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 mb-8"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Sign up with Google
          </motion.button>

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

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white h-12 rounded-full font-medium text-sm flex items-center justify-center hover:bg-zinc-800 transition-colors disabled:opacity-50 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account? <button onClick={onNavigateLogin} className="text-black font-medium underline underline-offset-4 hover:text-purple-600 transition-colors">Log in</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
