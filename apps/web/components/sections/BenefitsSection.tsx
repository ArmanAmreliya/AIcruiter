
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Zap, ArrowRight, CheckSquare, Square, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

export const BenefitsSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 0,
      title: "Smart Agenda Builder",
      description: "Melon drafts structured agendas from your calendar and docs.",
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      id: 1,
      title: "Live AI Notetaker",
      description: "While you focus on talking and listening, Melon takes down clean, real-time notes accurately.",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      id: 2,
      title: "Instant Recap & Highlights",
      description: "Auto-generated summaries with clear takeaways, decisions, and next steps.",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-black overflow-hidden relative">
      <div className="absolute inset-0 bg-black-grid dark:bg-purple-grid pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 lg:gap-24">
          
          <div className="w-full md:w-1/2">
             <div className="flex items-center gap-4 mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
                  Benefits
                </span>
                <div className="h-px bg-purple-200 dark:bg-purple-800 w-24"></div>
             </div>
             
             <h2 className="text-4xl md:text-5xl font-bold mb-12">
               Your AI <span className="text-purple-600">teammate</span> for every meeting
             </h2>

             <div className="space-y-6">
               {tabs.map((tab, index) => (
                 <motion.div 
                   key={tab.id}
                   layoutId={activeTab === index ? "highlight" : undefined}
                   onClick={() => setActiveTab(index)}
                   className={cn(
                     "relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2",
                     activeTab === index 
                       ? "bg-purple-50/50 dark:bg-purple-900/10 border-purple-500/30 shadow-lg" 
                       : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5"
                   )}
                 >
                    <div className="flex items-start gap-4">
                       <div className={cn("p-3 rounded-xl shrink-0", tab.bgColor, tab.color)}>
                         <tab.icon size={24} />
                       </div>
                       <div>
                         <h3 className={cn("text-xl font-bold mb-2", activeTab === index ? "text-purple-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>
                           {tab.title}
                         </h3>
                         <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                           {tab.description}
                         </p>
                       </div>
                    </div>
                 </motion.div>
               ))}
             </div>

             <div className="mt-12">
                <Button className="w-full md:w-auto bg-[#7C3AED] hover:bg-[#6D28D9]">Get Started - It's free <ArrowRight size={16} className="ml-2"/></Button>
             </div>
          </div>

          <div className="w-full md:w-1/2 relative min-h-[500px] flex items-center justify-center">
             <div className="absolute inset-0 bg-dot-pattern opacity-50"></div>
             <div className="absolute inset-0 bg-gradient-to-l from-white via-transparent to-transparent dark:from-black z-0"></div>

             <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 transition={{ duration: 0.3 }}
                 className="relative z-10 w-full"
               >
                 {activeTab === 0 && (
                   <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-8 max-w-md mx-auto">
                      <h3 className="font-bold text-lg mb-6 border-b pb-4 dark:border-white/10">Agenda for today</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-500/20">
                           <CheckSquare className="text-purple-600 mt-1" size={20} />
                           <div>
                             <p className="font-medium text-sm">UX testing with Senior developer...</p>
                             <p className="text-xs text-gray-400">30 Aug 2022 - 11:30AM</p>
                           </div>
                           <MoreHorizontal size={16} className="ml-auto text-gray-400" />
                        </div>
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                           <Square className="text-gray-300" size={20} />
                           <div>
                             <p className="font-medium text-sm text-gray-600 dark:text-gray-300">Collaborate with developers team...</p>
                             <p className="text-xs text-gray-400">30 Aug 2022 - 11:30AM</p>
                           </div>
                           <MoreHorizontal size={16} className="ml-auto text-gray-400" />
                        </div>
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                           <Square className="text-gray-300" size={20} />
                           <div>
                             <p className="font-medium text-sm text-gray-600 dark:text-gray-300">Complete Final Finance SaaS</p>
                             <p className="text-xs text-gray-400">30 Aug 2022 - 11:30AM</p>
                           </div>
                           <MoreHorizontal size={16} className="ml-auto text-gray-400" />
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-500/20">
                           <CheckSquare className="text-purple-600 mt-1" size={20} />
                           <div>
                             <p className="font-medium text-sm">Lunch with designs and developers</p>
                             <p className="text-xs text-gray-400">30 Aug 2022 - 11:30AM</p>
                           </div>
                           <MoreHorizontal size={16} className="ml-auto text-gray-400" />
                        </div>
                      </div>
                   </div>
                 )}

                 {activeTab === 1 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-8 max-w-md mx-auto min-h-[400px]">
                      <div className="flex items-center gap-3 mb-6 border-b pb-4 dark:border-white/10">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">AI</div>
                        <span className="text-sm font-semibold text-blue-600">Live Notetaker Active</span>
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-auto"></span>
                      </div>
                      <div className="space-y-2 font-mono text-sm text-gray-600 dark:text-gray-300">
                        <p>Sarah: <span className="text-gray-800 dark:text-white">Let's prioritize the mobile navigation for Q3.</span></p>
                        <p>Mark: <span className="text-gray-800 dark:text-white">Agreed. We noticed a 20% drop-off on checkout pages on iOS.</span></p>
                        <p className="opacity-50">AI: <span className="italic">Noting action item: Investigate iOS checkout drop-off.</span></p>
                        <motion.div 
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="w-2 h-4 bg-purple-600 inline-block align-middle ml-1"
                        ></motion.div>
                      </div>
                    </div>
                 )}

                 {activeTab === 2 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-8 max-w-md mx-auto">
                      <div className="flex items-center justify-between mb-6">
                         <h3 className="font-bold text-lg">Meeting Recap</h3>
                         <div className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">COMPLETED</div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Decisions</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Launch dark mode in next sprint</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Hire 2 new backend engineers</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Action Items</h4>
                        <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-white/5 rounded-lg mb-2">
                           <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs">SJ</div>
                           <span className="text-sm">Review design system updates</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                           <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs">MT</div>
                           <span className="text-sm">Setup CI/CD pipeline</span>
                        </div>
                      </div>
                    </div>
                 )}
               </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
