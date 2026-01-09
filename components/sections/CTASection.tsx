
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Rocket } from 'lucide-react';

export const CTASection = () => {
  return (
    <motion.section 
       initial={{ opacity: 0 }}
       whileInView={{ opacity: 1 }}
       viewport={{ once: true }}
       className="w-full py-16 md:py-24 relative overflow-hidden text-center flex flex-col items-center justify-center bg-[#6D28D9]"
    >
       <div className="absolute inset-0 bg-purple-grid mix-blend-overlay opacity-30 pointer-events-none" />

       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-60 pointer-events-none" />
       
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-white rounded-full blur-[120px] opacity-10 pointer-events-none" />

       <div className="relative z-10 max-w-4xl mx-auto px-6 font-sans">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-8 drop-shadow-xl"
          >
             AI powered interviews for <br/> productive teams
          </motion.h2>

          <motion.button
             whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0, 0.5)" }}
             whileTap={{ scale: 0.95 }}
             className="bg-white text-black h-12 px-8 rounded-full text-base font-bold mb-10 shadow-xl"
          >
             Get Started - It's free
          </motion.button>

          <motion.div 
             initial={{ y: 20, opacity: 0 }}
             whileInView={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2, duration: 0.6 }}
             className="flex flex-wrap justify-center gap-8 md:gap-16"
          >
             {[
               { icon: Clock, text: "Time-saving" },
               { icon: Users, text: "Team-ready" },
               { icon: Rocket, text: "Easy to start" }
             ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                   <benefit.icon size={20} className="text-white" />
                   <span className="text-white font-medium text-lg">{benefit.text}</span>
                </div>
             ))}
          </motion.div>
       </div>
    </motion.section>
  );
};
