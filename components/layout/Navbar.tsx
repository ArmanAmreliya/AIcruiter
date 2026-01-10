
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';

interface NavbarProps {
  onNavigateLogin: () => void;
}

export const Navbar = ({ onNavigateLogin }: NavbarProps) => {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'About', id: 'about' },
    { name: 'Features', id: 'features' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'Testimonials', id: 'testimonials' }
  ];

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "py-4" : "py-6"
      )}
    >
      <div className={cn(
        "max-w-7xl mx-auto px-6 transition-all duration-300",
        isScrolled ? "glass rounded-full shadow-sm mx-4 md:mx-auto max-w-5xl py-3" : ""
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
             <img width="48" height="48" src="https://img.icons8.com/forma-thin/96/7950F2/bot.png" alt="AIcruiter Bot Logo" className="w-8 h-8 md:w-10 md:h-10"/>
            <span className="text-xl font-bold tracking-tight">AIcruiter</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button 
                key={item.name} 
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium hover:text-purple-600 dark:hover:text-purple-400 transition-colors bg-transparent border-none cursor-pointer"
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Button variant="primary" className="h-10 px-5 text-sm" onClick={onNavigateLogin}>
              Get Started
            </Button>
          </div>

          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 p-4 m-4 glass rounded-2xl md:hidden border border-gray-200 dark:border-white/10 shadow-xl"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button 
                  key={item.name} 
                  onClick={() => scrollToSection(item.id)}
                  className="p-2 font-medium hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-left"
                >
                  {item.name}
                </button>
              ))}
              <div className="h-px bg-gray-200 dark:bg-white/10" />
              <div className="flex items-center justify-between p-2">
                <span className="font-medium">Theme</span>
                <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-white/10">
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
              </div>
              <Button className="w-full" onClick={onNavigateLogin}>Get Started</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
