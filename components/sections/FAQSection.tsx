
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

export const FAQSection = () => {
  const faqs = [
    { question: "What is AIcruiter?", answer: "AIcruiter is an AI-powered recruitment assistant that automates interview notes, screens candidates, and helps you make data-driven hiring decisions." },
    { question: "How does the real-time transcription help?", answer: "Our real-time transcription captures every word instantly, allowing you to focus on the conversation rather than taking notes. It also provides live sentiment analysis." },
    { question: "Can I customize the summary templates?", answer: "Yes, you can fully customize the summary output to match your organization's specific needs, competencies, and evaluation criteria." },
    { question: "Who is AIcruiter ideal for?", answer: "AIcruiter is perfect for high-growth startups, enterprise recruitment teams, and staffing agencies looking to streamline their hiring process and improve quality of hire." },
    { question: "Is the platform mobile-friendly?", answer: "Absolutely. AIcruiter is optimized for all devices, so you can review candidates, manage schedules, and access insights on the go." },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white dark:bg-black relative">
       <div className="absolute inset-0 bg-black-grid dark:bg-purple-grid pointer-events-none" />
       <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
             <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">
                FAQs
             </div>
             <h2 className="text-4xl font-bold text-black dark:text-white tracking-tight">Frequently Asked Questions</h2>
             <p className="mt-4 text-gray-500 dark:text-gray-400">Everything you need to know about using our AI assistant, from setup to security.</p>
          </div>

          <div className="space-y-4">
             {faqs.map((faq, idx) => (
                <div 
                   key={idx}
                   className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-zinc-900 overflow-hidden"
                >
                   <button 
                      onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-6 text-left font-medium text-lg text-black dark:text-white focus:outline-none"
                   >
                      {faq.question}
                      <motion.div
                         animate={{ rotate: openIndex === idx ? 45 : 0 }}
                         transition={{ duration: 0.2 }}
                      >
                         <Plus className="text-gray-400" />
                      </motion.div>
                   </button>
                   <AnimatePresence>
                      {openIndex === idx && (
                         <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                         >
                            <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                               {faq.answer}
                            </div>
                         </motion.div>
                      )}
                   </AnimatePresence>
                </div>
             ))}
          </div>
       </div>
    </section>
  );
};
