
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Basic",
      price: isYearly ? 14 : 19,
      description: "For individuals and small teams just getting started",
      features: ["Up to 10 meetings/month", "Meeting summaries & action items", "Calendar integration", "Email + Slack delivery"],
      isPremium: false
    },
    {
      name: "Premium",
      price: isYearly ? 29 : 39,
      description: "For growing teams who rely on better meeting outcomes",
      features: ["Unlimited meetings", "Advanced AI analytics", "CRM integration (HubSpot, Salesforce)", "Custom templates", "Priority support"],
      isPremium: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For enterprises that are in need to fully integrate employee data.",
      features: ["Everything in Premium", "SSO & Admin controls", "Dedicated Success Manager", "Custom AI model training", "API Access"],
      isPremium: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-black relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-purple-grid pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
         <div className="text-center mb-20">
           <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/10 text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">
             <Sparkles size={12} className="mr-2" /> Pricing
           </div>
           <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
             Simple pricing for <span className="text-[#6D28D9]">productive</span> teams
           </h2>
           <p className="text-gray-400 mb-8 max-w-xl mx-auto">
             Everything you need to know about using our AI assistant, from setup to security.
           </p>

           <div className="flex items-center justify-center gap-4">
             <span className={cn("text-sm font-medium transition-colors", !isYearly ? "text-white" : "text-gray-500")}>Monthly</span>
             <button
               onClick={() => setIsYearly(!isYearly)}
               className="relative w-14 h-8 rounded-full bg-zinc-800 border border-white/10 transition-colors focus:outline-none"
             >
               <motion.div
                 className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md"
                 animate={{ x: isYearly ? 24 : 0 }}
                 transition={{ type: "spring", stiffness: 500, damping: 30 }}
               />
             </button>
             <span className={cn("text-sm font-medium transition-colors", isYearly ? "text-white" : "text-gray-500")}>
               Yearly <span className="text-purple-400 text-xs ml-1 font-bold">(Save 20%)</span>
             </span>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={cn(
                  "flex flex-col p-8 rounded-[2rem] relative",
                  plan.isPremium 
                    ? "bg-zinc-900 border border-purple-500/30 shadow-2xl shadow-purple-900/20" 
                    : "bg-white text-black"
                )}
              >
                {plan.isPremium && (
                  <div className="absolute top-6 right-8 bg-[#6D28D9] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Popular
                  </div>
                )}
                
                <h3 className={cn("text-xl font-bold mb-2", plan.isPremium ? "text-white" : "text-black")}>{plan.name}</h3>
                
                <div className="mb-4">
                  {typeof plan.price === 'number' ? (
                    <span className={cn("text-4xl font-bold", plan.isPremium ? "text-white" : "text-black")}>${plan.price}<span className="text-lg font-normal opacity-60">/mo</span></span>
                  ) : (
                    <span className={cn("text-3xl font-bold", plan.isPremium ? "text-white" : "text-black")}>{plan.price} Pricing</span>
                  )}
                </div>

                <p className={cn("text-sm mb-8 leading-relaxed", plan.isPremium ? "text-gray-400" : "text-gray-600")}>
                  {plan.description}
                </p>

                <div className="flex-1 mb-8">
                  <p className={cn("text-xs font-bold uppercase tracking-wider mb-4", plan.isPremium ? "text-gray-500" : "text-gray-400")}>What's included</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 size={18} className={cn("shrink-0 mt-0.5", plan.isPremium ? "text-[#6D28D9]" : "text-black")} fill={plan.isPremium ? "currentColor" : "none"} />
                        <span className={plan.isPremium ? "text-gray-300" : "text-gray-700"}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  className={cn(
                    "w-full py-3 rounded-full font-bold text-sm transition-transform active:scale-95",
                    plan.isPremium 
                      ? "bg-[#6D28D9] text-white hover:bg-[#5b21b6]" 
                      : "bg-black text-white hover:bg-gray-800"
                  )}
                >
                  Get Started - It's free ›
                </button>
              </motion.div>
            ))}
         </div>

         <div className="text-center">
            <p className="text-gray-500 text-sm font-medium mb-8">Join leading companies who trust our platform to power their business.</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale">
               <div className="text-xl font-bold font-sans tracking-tight">Hitech</div>
               <div className="text-xl font-bold font-serif italic">PinPoint</div>
               <div className="text-xl font-bold font-mono">INSPIRE</div>
               <div className="text-xl font-extrabold tracking-widest">ORBITC</div>
               <div className="text-xl font-bold font-sans tracking-tight hidden md:block">Hitech</div>
               <div className="text-xl font-bold font-serif italic hidden md:block">PinPoint</div>
            </div>
         </div>
      </div>
    </section>
  );
};
