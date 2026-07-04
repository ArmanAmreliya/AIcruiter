"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import { HeroSection } from "../sections/HeroSection";
import { AboutSection } from "../sections/AboutSection";
import { FeaturesSection } from "../sections/FeaturesSection";
import { BenefitsSection } from "../sections/BenefitsSection";
import { TestimonialsSection } from "../sections/TestimonialsSection";
import { FAQSection } from "../sections/FAQSection";
import { PricingSection } from "../sections/PricingSection";
import { CTASection } from "../sections/CTASection";

export const LandingPage = () => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-landing-button="true"]',
        { y: 18, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
        },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <main>
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <BenefitsSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </main>
  );
};
