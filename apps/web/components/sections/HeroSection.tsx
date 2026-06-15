
import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-screen flex flex-col items-center justify-center">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-black-grid dark:bg-purple-grid" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge>AIcruiter 2.0 is live</Badge>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8 text-slate-900 dark:text-white"
        >
          Your{' '}
          <span className="inline-flex align-middle mx-2 p-2 bg-white dark:bg-white/10 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
             <img src="https://img.icons8.com/glyph-neue/64/6D28D9/online-support.png" alt="Bot" className="w-8 h-8 md:w-12 md:h-12" />
          </span>{' '}
          AI assistant
          <br className="hidden md:block" />
          for every{' '}
          <span className="inline-flex align-middle mx-2 p-2 bg-white dark:bg-white/10 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 rotate-[2deg] hover:rotate-0 transition-transform duration-300">
             <img src="https://img.icons8.com/ios-filled/50/6D28D9/microphone--v1.png" alt="Mic" className="w-8 h-8 md:w-10 md:h-10" />
          </span>{' '}
          meeting
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Say goodbye to scrambling for notes. Our AI captures, transcribes, and screens candidates automatically, so you can focus on the connection.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Button className="w-full sm:w-auto h-12 px-8 text-lg">
            Get Started - It's free
          </Button>
          <Button variant="outline" className="w-full sm:w-auto h-12 px-8 text-lg group">
            <Play size={16} className="mr-2 fill-current" />
            See how it works
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mx-auto max-w-4xl"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-20 dark:opacity-30"></div>
          <div className="relative rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center">
             <div className="absolute inset-0 p-4 grid grid-cols-12 gap-4">
                <div className="col-span-3 bg-white/40 dark:bg-white/5 rounded-lg border border-white/20 dark:border-white/5 animate-pulse"></div>
                <div className="col-span-9 flex flex-col gap-4">
                   <div className="h-16 bg-white/40 dark:bg-white/5 rounded-lg border border-white/20 dark:border-white/5"></div>
                   <div className="flex-1 bg-white/40 dark:bg-white/5 rounded-lg border border-white/20 dark:border-white/5"></div>
                </div>
             </div>
             <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center backdrop-blur-sm">
                  <Play className="text-purple-600 ml-1" fill="currentColor" size={32} />
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
