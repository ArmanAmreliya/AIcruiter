import React from 'react';
import { Star } from 'lucide-react';

const TestimonialCard: React.FC<{ t: any }> = ({ t }) => (
  <div className="w-[400px] p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shrink-0 mx-4 whitespace-normal shadow-sm hover:shadow-md transition-shadow">
    <div className="flex gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={18} className="fill-black dark:fill-white text-black dark:text-white" />
      ))}
    </div>
    <p className="text-zinc-800 dark:text-zinc-200 font-medium text-lg leading-relaxed mb-6">
      "{t.text}"
    </p>
    <div className="flex items-center gap-3">
      <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover bg-zinc-100 dark:bg-zinc-800" />
      <div>
        <div className="font-bold text-black dark:text-white text-sm">{t.name}</div>
        <div className="text-zinc-500 text-xs">{t.role}</div>
      </div>
    </div>
  </div>
);

export const TestimonialsSection = () => {
  const testimonialsTop = [
    {
      name: "Cristofer Levin",
      role: "CEO @ TechStart",
      text: "The meeting summaries and smart recaps are perfect for saving time and keeping our team aligned.",
      avatar: "https://i.pravatar.cc/150?u=1"
    },
    {
      name: "Marilyn George",
      role: "Product Manager",
      text: "The automatic notes and AI-generated insights are perfect for our team and improving productivity fast.",
      avatar: "https://i.pravatar.cc/150?u=2"
    },
    {
      name: "Martin Ekstrom",
      role: "Senior Dev",
      text: "The real-time transcripts and speaker tracking are perfect for our calls and following up with clarity.",
      avatar: "https://i.pravatar.cc/150?u=3"
    },
    {
      name: "Lydia Calzoni",
      role: "Founder",
      text: "I used to spend hours on follow-up emails. Now it takes seconds. AIcruiter is a lifesaver.",
      avatar: "https://i.pravatar.cc/150?u=4"
    }
  ];

  const testimonialsBottom = [
    {
      name: "Jaydon Aminoff",
      role: "Hiring Manager",
      text: "The candidate screening features are unmatched. It feels like magic.",
      avatar: "https://i.pravatar.cc/150?u=5"
    },
    {
      name: "Tiana Baptista",
      role: "HR Director",
      text: "Integration with our calendar was seamless. The dashboard is clean and intuitive.",
      avatar: "https://i.pravatar.cc/150?u=6"
    },
    {
      name: "Kierra Herwitz",
      role: "VP of Engineering",
      text: "Finally, a tool that actually understands technical jargon during interviews.",
      avatar: "https://i.pravatar.cc/150?u=7"
    },
     {
      name: "Cooper Septimus",
      role: "Lead Recruiter",
      text: "Our time-to-hire dropped by 40% within the first month of using AIcruiter.",
      avatar: "https://i.pravatar.cc/150?u=8"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-white dark:bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-black-grid dark:bg-purple-grid pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 text-center mb-16 relative z-10">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">
          Testimonials
        </div>
        <h2 className="text-5xl font-bold mb-6 text-black dark:text-white tracking-tight">
          What our <span className="text-[#6D28D9] dark:text-[#A78BFA]">clients</span> are saying
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
          Everything you need to know about using our AI assistant, from setup to security. Still curious? Drop us a message and we’ll get right back to you.
        </p>
      </div>

      <div className="flex flex-col gap-8 mb-20 relative z-0">
        <div className="flex overflow-hidden group">
           <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
              {[...testimonialsTop, ...testimonialsTop, ...testimonialsTop, ...testimonialsTop].map((t, i) => (
                <TestimonialCard key={`top-${i}`} t={t} />
              ))}
           </div>
        </div>

        <div className="flex overflow-hidden group">
           <div className="flex animate-marquee-reverse group-hover:[animation-play-state:paused]">
              {[...testimonialsBottom, ...testimonialsBottom, ...testimonialsBottom, ...testimonialsBottom].map((t, i) => (
                <TestimonialCard key={`bottom-${i}`} t={t} />
              ))}
           </div>
        </div>
        
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-black to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-black to-transparent z-10 pointer-events-none"></div>
      </div>

      <div className="flex justify-center relative z-20 px-6">
        <div className="bg-black dark:bg-zinc-900 rounded-full p-2 pl-3 pr-2 flex items-center gap-4 shadow-2xl animate-fade-in-up max-w-full border border-zinc-800">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-zinc-700">
               <img src="https://i.pravatar.cc/150?u=support" alt="Jake" className="w-full h-full object-cover" />
             </div>
             <div className="text-white text-sm hidden sm:block">
               <span className="text-zinc-400">Hello 👋 I'm Jake from support.</span> Let me know if you have any questions.
             </div>
             <div className="text-white text-sm sm:hidden">
               Contact Support
             </div>
          </div>
          <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors">
            Contact Us
          </button>
        </div>
      </div>

    </section>
  );
};