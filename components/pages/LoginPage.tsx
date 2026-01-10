
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

// --- Zod Schema ---
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginPageProps {
  onBack: () => void;
  onNavigateSignup: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage = ({ onBack, onNavigateSignup, onLoginSuccess }: LoginPageProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast.success(`Welcome back!`);
      // Add a slight delay to show the toast before transition
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Could not sign in with Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      <Toaster position="top-center" richColors />
      
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 relative bg-white">
        <motion.button 
           onClick={onBack}
           whileHover={{ x: -4 }}
           className="absolute top-8 left-8 text-black flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back
        </motion.button>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="w-full max-w-md mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <img width="48" height="48" src="https://img.icons8.com/forma-thin/96/7950F2/bot.png" alt="Logo" className="w-10 h-10"/>
            <span className="text-xl font-bold tracking-tight text-black">AIcruiter</span>
          </div>

          <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">Welcome back</h1>
          <p className="text-gray-500 mb-8">Enter your details to access your recruitment dashboard.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">Email</label>
              <input 
                {...register('email')}
                type="email"
                placeholder="name@company.com"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border bg-white text-black outline-none transition-all focus:ring-2",
                  errors.email 
                    ? "border-purple-600 focus:ring-purple-600/20" 
                    : "border-gray-200 focus:border-black focus:ring-gray-100"
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
                  "w-full px-4 py-3 rounded-xl border bg-white text-black outline-none transition-all focus:ring-2",
                  errors.password 
                    ? "border-purple-600 focus:ring-purple-600/20" 
                    : "border-gray-200 focus:border-black focus:ring-gray-100"
                )}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-xs font-medium text-[#6D28D9]">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black" />
                 <span className="text-sm text-gray-500">Remember me</span>
               </label>
               <a href="#" className="text-sm font-medium text-black hover:underline">Forgot password?</a>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white h-12 rounded-full font-medium text-sm flex items-center justify-center hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Sign in with Email"}
            </motion.button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border border-gray-200 text-black h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </motion.button>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account? <button onClick={onNavigateSignup} className="text-black font-medium hover:underline">Sign up for free</button>
          </p>
        </motion.div>
      </div>

      {/* Right Column: Visual */}
      <div className="hidden lg:flex w-1/2 bg-black relative flex-col items-center justify-center p-12 overflow-hidden text-center">
         <div className="absolute inset-0 bg-purple-grid opacity-30" />
         
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[100px]" />

         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2, duration: 0.8 }}
           className="relative z-10 max-w-lg"
         >
            <h2 className="text-5xl font-bold text-white tracking-tight leading-tight mb-6">
              The future of hiring is <span className="text-[#A78BFA]">vocal.</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Join thousands of forward-thinking teams using AIcruiter to streamline their interview process.
            </p>
         </motion.div>

         {/* Decorative Floating Elements */}
         <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-1/4 right-1/4 opacity-50"
         >
             <div className="w-24 h-24 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-full blur-xl" />
         </motion.div>
      </div>
    </div>
  );
};
