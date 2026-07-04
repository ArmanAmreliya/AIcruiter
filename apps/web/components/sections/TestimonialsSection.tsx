import React from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

const TestimonialCard: React.FC<{ t: any }> = ({ t }) => (
  <div className="w-[400px] p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shrink-0 mx-4 whitespace-normal shadow-sm hover:shadow-md transition-shadow">
    <div className="flex gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={18}
          className="fill-black dark:fill-white text-black dark:text-white"
        />
      ))}
    </div>
    <p className="text-zinc-800 dark:text-zinc-200 font-medium text-lg leading-relaxed mb-6">
      "{t.text}"
    </p>
    <div className="flex items-center gap-3">
      <img
        src={t.avatar}
        alt={t.name}
        className="w-10 h-10 rounded-full object-cover bg-zinc-100 dark:bg-zinc-800"
      />
      <div>
        <div className="font-bold text-black dark:text-white text-sm">
          {t.name}
        </div>
        <div className="text-zinc-500 text-xs">{t.role}</div>
      </div>
    </div>
  </div>
);

export const TestimonialsSection = () => {
  const router = useRouter();

  const testimonialsTop = [
    {
      name: "Nadia Brooks",
      role: "Head of Talent @ ScaleForge",
      text: "AIcruiter helped us screen more candidates without lowering our standards. The reports make shortlist decisions much faster.",
      avatar: "https://i.pravatar.cc/150?u=1",
    },
    {
      name: "Ethan Cole",
      role: "Recruiting Lead",
      text: "The live transcripts and structured summaries save our recruiters hours every week and keep feedback much more consistent.",
      avatar: "https://i.pravatar.cc/150?u=2",
    },
    {
      name: "Priya Raman",
      role: "VP People Operations",
      text: "What stood out was how quickly AIcruiter turned candidate conversations into usable hiring signals our team could actually act on.",
      avatar: "https://i.pravatar.cc/150?u=3",
    },
    {
      name: "Marcus Hill",
      role: "Founder",
      text: "We used to lose momentum after first-round interviews. Now every conversation ends with a clear summary and next step.",
      avatar: "https://i.pravatar.cc/150?u=4",
    },
  ];

  const testimonialsBottom = [
    {
      name: "Leah Kim",
      role: "Hiring Manager",
      text: "AIcruiter gives me better candidate context before final interviews, so I spend my time with stronger prospects.",
      avatar: "https://i.pravatar.cc/150?u=5",
    },
    {
      name: "Jordan Alvarez",
      role: "HR Director",
      text: "The platform feels polished, but the real value is operational. Our team can handle more applicants without adding chaos.",
      avatar: "https://i.pravatar.cc/150?u=6",
    },
    {
      name: "Aarav Patel",
      role: "VP Engineering",
      text: "For technical hiring, the transcripts and summaries preserve the details I care about instead of flattening the conversation.",
      avatar: "https://i.pravatar.cc/150?u=7",
    },
    {
      name: "Sofia Mendes",
      role: "Lead Recruiter",
      text: "We shortened screening turnaround dramatically because recruiters no longer have to write everything up by hand.",
      avatar: "https://i.pravatar.cc/150?u=8",
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-24 bg-white dark:bg-black relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-black-grid dark:bg-purple-grid pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 text-center mb-16 relative z-10">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">
          Testimonials
        </div>
        <h2 className="text-5xl font-bold mb-6 text-black dark:text-white tracking-tight">
          What hiring{" "}
          <span className="text-[#6D28D9] dark:text-[#A78BFA]">teams</span> are
          saying
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
          Teams use AIcruiter to scale first-round interviews, standardize
          evaluation, and reduce the manual work that slows down hiring.
        </p>
      </div>

      <div className="flex flex-col gap-8 mb-20 relative z-0">
        <div className="flex overflow-hidden group">
          <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
            {[
              ...testimonialsTop,
              ...testimonialsTop,
              ...testimonialsTop,
              ...testimonialsTop,
            ].map((t, i) => (
              <TestimonialCard key={`top-${i}`} t={t} />
            ))}
          </div>
        </div>

        <div className="flex overflow-hidden group">
          <div className="flex animate-marquee-reverse group-hover:[animation-play-state:paused]">
            {[
              ...testimonialsBottom,
              ...testimonialsBottom,
              ...testimonialsBottom,
              ...testimonialsBottom,
            ].map((t, i) => (
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
              <img
                src="https://i.pravatar.cc/150?u=support"
                alt="Jake"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white text-sm hidden sm:block">
              <span className="text-zinc-400">
                Hello 👋 I'm Jake from AIcruiter.
              </span>{" "}
              Let me know if you have any questions.
            </div>
            <div className="text-white text-sm sm:hidden">Talk to our team</div>
          </div>
          <button
            data-landing-button="true"
            onClick={() => router.push("/login")}
            className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99]"
          >
            Book a Demo
          </button>
        </div>
      </div>
    </section>
  );
};
