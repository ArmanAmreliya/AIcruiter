
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, User, Cloud, Lock } from 'lucide-react';

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative z-10 bg-gray-50 dark:bg-black">
      <div className="absolute inset-0 bg-black-grid dark:bg-purple-grid pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-gray-200 dark:border-white/20 text-xs font-semibold uppercase tracking-wider mb-6">
            Features
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Smarter Meetings, Made Simple</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            From meeting prep to follow-up, our platform equips your team with the tools, context, and clarity to stay aligned.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-purple-100 dark:border-white/10 shadow-lg min-h-[400px] flex flex-col justify-end"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-zinc-900 dark:to-zinc-800 z-0"></div>
            <div className="absolute inset-0 flex items-center justify-center z-10 pb-20">
               <div className="relative w-48 h-48 rounded-2xl bg-gradient-to-tr from-purple-100 to-white dark:from-purple-900/30 dark:to-zinc-800 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center shadow-inner overflow-hidden">
                  <FileText size={64} className="text-purple-400 dark:text-purple-500 opacity-50" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-scan"></div>
                  <div className="absolute inset-4 border border-dashed border-purple-200 dark:border-purple-700/30 rounded-xl"></div>
               </div>
            </div>
            <div className="relative z-20">
              <h3 className="text-2xl font-bold mb-2">Auto-Summarized Meeting Notes</h3>
              <p className="text-gray-500 dark:text-gray-400">Instantly generate comprehensive notes that capture every detail.</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-purple-100 dark:border-white/10 shadow-lg min-h-[400px] flex flex-col justify-end"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-zinc-900 dark:to-zinc-800 z-0"></div>
             <div className="absolute inset-0 flex items-center justify-center z-10 pb-20">
                <div className="relative w-full px-12">
                   <svg viewBox="0 0 400 100" className="w-full h-32 stroke-purple-400 dark:stroke-purple-500 fill-none stroke-[2]" preserveAspectRatio="none">
                      <path d="M0,50 Q20,40 40,50 T80,50 T120,30 T160,50 T200,70 T240,50 T280,20 T320,50 T360,50 T400,50" />
                      <line x1="0" y1="20" x2="400" y2="20" strokeDasharray="4" className="stroke-purple-200 dark:stroke-zinc-700 stroke-[1]" />
                      <line x1="0" y1="80" x2="400" y2="80" strokeDasharray="4" className="stroke-purple-200 dark:stroke-zinc-700 stroke-[1]" />
                      <line x1="100" y1="0" x2="100" y2="100" strokeDasharray="4" className="stroke-purple-200 dark:stroke-zinc-700 stroke-[1]" />
                      <line x1="300" y1="0" x2="300" y2="100" strokeDasharray="4" className="stroke-purple-200 dark:stroke-zinc-700 stroke-[1]" />
                   </svg>
                   <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/3 -translate-y-1/2 bg-white dark:bg-zinc-800 shadow-xl rounded-xl p-3 flex items-center gap-3 border border-purple-100 dark:border-white/10 max-w-[220px]"
                   >
                      <div className="w-8 h-8 rounded-full bg-orange-100 shrink-0 overflow-hidden">
                        <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" className="w-full h-full object-cover"/>
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold mb-0.5">Great! we can move forward...</p>
                        <p className="text-green-500 text-[10px] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Real time transcription</p>
                      </div>
                   </motion.div>
                </div>
             </div>
             <div className="relative z-20">
              <h3 className="text-2xl font-bold mb-2">Real-Time Transcription</h3>
              <p className="text-gray-500 dark:text-gray-400">Capture every word as it’s spoken with live transcription across all platforms.</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-purple-100 dark:border-white/10 shadow-lg min-h-[400px] flex flex-col justify-end"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-zinc-900 dark:to-zinc-800 z-0"></div>
             <div className="absolute inset-0 flex items-center justify-center z-10 pb-20">
                <div className="relative w-64 h-64 flex items-center justify-center">
                    <div className="absolute inset-0 border border-purple-100 dark:border-white/5 rounded-full"></div>
                    <div className="absolute inset-8 border border-purple-100 dark:border-white/5 rounded-full"></div>
                    <div className="absolute inset-16 border border-purple-100 dark:border-white/5 rounded-full"></div>
                    <div className="w-16 h-16 bg-white dark:bg-black rounded-full shadow-lg border border-purple-100 dark:border-white/10 flex items-center justify-center z-20">
                       <User size={32} className="text-black dark:text-white" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-purple-100 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden">
                      <img src="https://i.pravatar.cc/150?u=1" className="w-full h-full object-cover"/>
                    </div>
                    <div className="absolute bottom-12 right-0 w-10 h-10 bg-blue-100 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden">
                       <img src="https://i.pravatar.cc/150?u=2" className="w-full h-full object-cover"/>
                    </div>
                    <div className="absolute bottom-12 left-0 w-10 h-10 bg-green-100 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden">
                       <img src="https://i.pravatar.cc/150?u=3" className="w-full h-full object-cover"/>
                    </div>
                </div>
             </div>
             <div className="relative z-20">
              <h3 className="text-2xl font-bold mb-2">Speaker Identification</h3>
              <p className="text-gray-500 dark:text-gray-400">Know exactly who said what, with smart labeling and timestamps.</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-purple-100 dark:border-white/10 shadow-lg min-h-[400px] flex flex-col justify-end"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-zinc-900 dark:to-zinc-800 z-0"></div>
             <div className="absolute inset-0 flex items-center justify-center z-10 pb-20">
                <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm p-6 rounded-full border border-purple-100 dark:border-white/10 shadow-xl flex items-center gap-8">
                   <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <Cloud size={28} />
                   </div>
                   <div className="w-32 h-10 bg-purple-100 dark:bg-zinc-700 rounded-full relative p-1">
                      <div className="w-full h-full flex items-center justify-between px-3 text-xs font-bold text-purple-400">
                        <span>OFF</span>
                        <span>ON</span>
                      </div>
                      <div className="absolute top-1 right-1 h-8 w-16 bg-white dark:bg-black rounded-full shadow-md"></div>
                   </div>
                   <div className="w-14 h-14 bg-white dark:bg-zinc-700 rounded-2xl flex items-center justify-center text-purple-600 dark:text-white shadow-lg border border-purple-100 dark:border-white/5">
                      <Lock size={28} />
                   </div>
                </div>
             </div>
             <div className="relative z-20">
              <h3 className="text-2xl font-bold mb-2">Enterprise Security</h3>
              <p className="text-gray-500 dark:text-gray-400">Keep your data safe with enterprise-grade encryption and privacy controls.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
