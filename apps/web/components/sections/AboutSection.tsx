
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MoreHorizontal, Video, User, PieChart, Lock, Globe } from 'lucide-react';

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-white dark:bg-black overflow-hidden relative">
      <div className="absolute inset-0 bg-black-grid dark:bg-purple-grid pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20"
        >
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
                About Us
              </span>
              <div className="h-px bg-purple-200 dark:bg-purple-800 w-24"></div>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Purpose-built for <br/><span className="text-black dark:text-white">high-performing teams</span>
            </h2>
            
            <p className="text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-lg">
              Designed to help you focus on what matters most: collaboration, clarity, and action.
            </p>
            
            <button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-3 rounded-md font-medium transition-colors flex items-center group">
              Get Started - It's free
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="relative flex items-center justify-center mt-8 lg:mt-0"
          >
            <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full scale-90"></div>
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-6 animate-float">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Today Meetings</h3>
                <MoreHorizontal size={20} className="text-zinc-400" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">Logo and branding guide</p>
                    <p className="text-xs text-zinc-500">11:15AM - 12:30PM</p>
                  </div>
                  <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                    <Video size={16} />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-500/20">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-purple-900 dark:text-purple-100">UX research for new SaaS</p>
                    <p className="text-xs text-purple-600 dark:text-purple-300">01:00PM - 02:00PM</p>
                  </div>
                  <div className="p-2 rounded-full bg-[#7C3AED] text-white shadow-md">
                    <Video size={16} />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                    <img src="https://i.pravatar.cc/150?u=a04258114e29026302d" alt="User" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">Meet with developers</p>
                    <p className="text-xs text-zinc-500">05:10PM - 05:45PM</p>
                  </div>
                  <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                    <Video size={16} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 lg:mt-0">
            {[
              { icon: User, text: "Human-first, AI-backed" },
              { icon: PieChart, text: "Made for teams of all sizes" },
              { icon: Lock, text: "Privacy by design" },
              { icon: Globe, text: "Global by default" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-xl shadow-sm flex flex-col items-start gap-4 transition-shadow hover:shadow-md"
              >
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-[#7C3AED]">
                  <feature.icon size={20} />
                </div>
                <h4 className="font-medium text-sm">{feature.text}</h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
