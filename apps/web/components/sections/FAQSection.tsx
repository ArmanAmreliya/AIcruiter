import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

export const FAQSection = () => {
  const faqs = [
    {
      question: "What does AIcruiter actually automate?",
      answer:
        "AIcruiter automates first-round voice screening, live interview transcription, candidate summaries, and post-interview evaluation workflows so recruiters can move faster with less manual work.",
    },
    {
      question: "How does AIcruiter handle live voice interviews?",
      answer:
        "The platform is built around a browser-direct audio pipeline that securely connects candidate audio to Deepgram for real-time speech processing, reducing latency and avoiding unnecessary server bottlenecks.",
    },
    {
      question: "What happens after an interview is completed?",
      answer:
        "Once an interview is marked complete, AIcruiter can generate an AI-powered evaluation report that summarizes responses, surfaces strengths and gaps, and helps recruiters decide the next step.",
    },
    {
      question: "Who is AIcruiter best suited for?",
      answer:
        "AIcruiter is a strong fit for startups, recruiting teams, and staffing organizations that need to screen more candidates while keeping hiring quality and review consistency high.",
    },
    {
      question: "Can teams use AIcruiter in existing workflows?",
      answer:
        "Yes. The platform is designed as a modern full-stack hiring product with shared schemas, dashboard workflows, and extensible backend services that can support more advanced recruiting operations over time.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-white dark:bg-black relative">
      <div className="absolute inset-0 bg-black-grid dark:bg-purple-grid pointer-events-none" />
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">
            FAQs
          </div>
          <h2 className="text-4xl font-bold text-black dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Key answers about AIcruiter, the interview flow, and the
            architecture behind the product.
          </p>
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
