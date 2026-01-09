
import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { FeaturesSection } from './components/sections/FeaturesSection';
import { BenefitsSection } from './components/sections/BenefitsSection';
import { TestimonialsSection } from './components/sections/TestimonialsSection';
import { FAQSection } from './components/sections/FAQSection';
import { PricingSection } from './components/sections/PricingSection';
import { CTASection } from './components/sections/CTASection';
import { Footer } from './components/layout/Footer';

export const App = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
        <Navbar />
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
        <Footer />
      </div>
    </ThemeProvider>
  );
};
