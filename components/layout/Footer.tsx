
import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Youtube, Linkedin, Instagram } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Footer = () => {
  const socialLinks = [
    { icon: Twitter, label: "X (Twitter)" },
    { icon: Youtube, label: "Youtube" },
    { icon: Linkedin, label: "LinkedIn" },
    { icon: Instagram, label: "Instagram" },
  ];

  return (
    <footer className="bg-black text-white pt-24 pb-0 overflow-hidden relative">
      <div className="absolute inset-0 bg-purple-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 mb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20">
          
          <div className="col-span-1 md:col-span-5 flex flex-col items-start">
             <div className="flex items-center gap-3 mb-6">
                <img width="64" height="64" src="https://img.icons8.com/forma-thin/96/7950F2/bot.png" alt="AIcruiter Bot Logo" className="w-12 h-12"/>
                <span className="text-3xl font-bold tracking-tight">AIcruiter</span>
             </div>
             <p className="text-gray-400 text-lg leading-relaxed max-w-sm mb-8">
               Your smart meeting assistant for better notes, insights, and follow-up. 
               Automate the busy work, focus on the talent.
             </p>
             <div className="text-sm text-gray-500">
               © 2026 AIcruiter Inc. All rights reserved.
             </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="font-bold text-lg mb-6">Product</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Reviews</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-bold text-lg mb-6">Legal</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3">
             <h4 className="font-bold text-lg mb-6">Others</h4>
             <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">404</a></li>
             </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-white/10 rounded-2xl overflow-hidden">
           {socialLinks.map((social, idx) => (
             <motion.a 
               key={social.label}
               href="#" 
               className={cn(
                 "p-6 flex items-center gap-4 transition-colors border-white/10 bg-black",
                 idx !== socialLinks.length - 1 ? "border-b sm:border-b-0 lg:border-r" : ""
               )}
               whileHover={{ backgroundColor: "#6D28D9" }}
               transition={{ duration: 0.2 }}
             >
               <social.icon size={24} className="text-white" />
               <span className="font-medium text-lg text-white">{social.label}</span>
             </motion.a>
           ))}
        </div>
      </div>

      <div className="w-full flex justify-center items-end overflow-hidden pointer-events-none select-none relative">
        <h1 className="text-[20vw] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-600 z-10 relative">
          AIcruiter
        </h1>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-purple-900/20 blur-[100px] z-0" />
      </div>
    </footer>
  );
};
