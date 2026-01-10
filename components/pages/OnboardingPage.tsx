
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Building2, User, Globe } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { cn } from '../../lib/utils';
import { submitOnboarding, onboardingSchema, type OnboardingData } from '../../app/actions/onboarding';

interface OnboardingPageProps {
  userEmail: string;
  onComplete: () => void;
}

export const OnboardingPage = ({ userEmail, onComplete }: OnboardingPageProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
    watch,
  } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
  });

  const formValues = watch();

  const handleNext = async () => {
    const step1Valid = await trigger(['fullName', 'role']);
    if (step1Valid) setStep(2);
  };

  const onSubmit = async (data: OnboardingData) => {
    setIsSubmitting(true);
    try {
      await submitOnboarding(userEmail, data);
      toast.success(`Welcome to AiCruiter, ${data.fullName.split(' ')[0]}!`);
      // Short delay for effect
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <Toaster position="top-center" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-purple-grid opacity-5 pointer-events-none" />
      
      <div className="w-full max-w-lg relative z-10">
        {/* Progress Bar */}
        <div className="mb-12">
           <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              <span className={cn(step >= 1 ? "text-purple-600" : "")}>Step 1: About You</span>
              <span className={cn(step >= 2 ? "text-purple-600" : "")}>Step 2: Company</span>
           </div>
           <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-purple-600"
                initial={{ width: "0%" }}
                animate={{ width: step === 1 ? "50%" : "100%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
           </div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white"
        >
           <form onSubmit={handleSubmit(onSubmit)}>
             <AnimatePresence mode="wait">
               {step === 1 && (
                 <motion.div
                   key="step1"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-6"
                 >
                   <div className="text-center mb-8">
                     <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600">
                        <User size={32} />
                     </div>
                     <h1 className="text-3xl font-bold tracking-tight mb-2">Let's get to know you</h1>
                     <p className="text-gray-500">We'll personalize your dashboard based on your role.</p>
                   </div>

                   <div className="space-y-4">
                     <div className="space-y-2">
                       <label className="text-sm font-bold">Full Name</label>
                       <input 
                         {...register('fullName')}
                         placeholder="e.g. Alex Smith"
                         className={cn(
                           "w-full px-4 py-4 rounded-2xl border-2 bg-white outline-none transition-all",
                           errors.fullName 
                             ? "border-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" 
                             : "border-black/5 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
                         )}
                       />
                       {errors.fullName && <p className="text-xs text-red-500 font-medium ml-1">{errors.fullName.message}</p>}
                     </div>

                     <div className="space-y-2">
                       <label className="text-sm font-bold">Job Role</label>
                       <div className="relative">
                         <select 
                           {...register('role')}
                           className={cn(
                            "w-full px-4 py-4 rounded-2xl border-2 bg-white outline-none transition-all appearance-none cursor-pointer",
                             errors.role 
                               ? "border-red-100 focus:border-red-500" 
                               : "border-black/5 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
                           )}
                         >
                           <option value="">Select your role...</option>
                           <option value="Recruiter">Recruiter</option>
                           <option value="Hiring Manager">Hiring Manager</option>
                           <option value="Founder">Founder</option>
                           <option value="HR Director">HR Director</option>
                         </select>
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                           <ArrowRight size={16} className="rotate-90" />
                         </div>
                       </div>
                       {errors.role && <p className="text-xs text-red-500 font-medium ml-1">{errors.role.message}</p>}
                     </div>
                   </div>

                   <button
                     type="button"
                     onClick={handleNext}
                     className="w-full h-14 bg-black text-white rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8"
                   >
                     Next Step <ArrowRight size={18} />
                   </button>
                 </motion.div>
               )}

               {step === 2 && (
                 <motion.div
                   key="step2"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-6"
                 >
                   <div className="text-center mb-8">
                     <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <Building2 size={32} />
                     </div>
                     <h1 className="text-3xl font-bold tracking-tight mb-2">Tell us about your company</h1>
                     <p className="text-gray-500">We'll use this to brand your interview pages.</p>
                   </div>

                   <div className="space-y-4">
                     <div className="space-y-2">
                       <label className="text-sm font-bold">Company Name</label>
                       <input 
                         {...register('companyName')}
                         placeholder="e.g. Acme Corp"
                         className={cn(
                           "w-full px-4 py-4 rounded-2xl border-2 bg-white outline-none transition-all",
                           errors.companyName 
                             ? "border-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" 
                             : "border-black/5 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
                         )}
                       />
                       {errors.companyName && <p className="text-xs text-red-500 font-medium ml-1">{errors.companyName.message}</p>}
                     </div>

                     <div className="space-y-2">
                       <label className="text-sm font-bold flex items-center justify-between">
                         Website <span className="text-gray-400 font-normal text-xs">Optional</span>
                       </label>
                       <div className="relative">
                         <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                         <input 
                           {...register('website')}
                           placeholder="www.acme.com"
                           className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-black/5 bg-white outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
                         />
                       </div>
                     </div>
                   </div>

                   <div className="flex gap-4 mt-8">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="h-14 px-6 rounded-full font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 h-14 bg-black text-white rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {isSubmitting ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Complete Setup <Check size={18} /></>
                        )}
                      </button>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </form>
        </motion.div>
      </div>
    </div>
  );
};
