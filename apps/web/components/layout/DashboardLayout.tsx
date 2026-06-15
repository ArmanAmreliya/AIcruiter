import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import {
  Menu,
  Bell,
  Search,
  Moon,
  Sun,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { Sidebar } from './Sidebar';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  onLogout: () => void;
  onCreateJob: () => void;
}

export const DashboardLayout = ({ children, onLogout, onCreateJob }: DashboardLayoutProps) => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/candidates?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className={cn("min-h-screen flex transition-colors duration-300", theme === 'light' ? "bg-white" : "bg-black")}>
      <Toaster position="top-right" richColors />

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:block fixed left-0 top-0 bottom-0 w-[280px] z-50 border-r transition-colors duration-300",
        theme === 'light'
          ? "bg-white border-black/5"
          : "bg-black border-white/10"
      )}>
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className={cn(
                "lg:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50 border-r transition-colors",
                theme === 'light'
                  ? "bg-white border-black/5"
                  : "bg-black border-white/10"
              )}
            >
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        "lg:pl-[280px]" // Offset for fixed sidebar
      )}>

        {/* Header */}
        <header className={cn(
          "sticky top-0 z-30 h-16 px-6 flex items-center justify-between border-b backdrop-blur-xl transition-colors duration-300",
          theme === 'light'
            ? "bg-white/80 border-black/5"
            : "bg-black/80 border-white/10"
        )}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn("lg:hidden p-2 rounded-lg", theme === 'light' ? "hover:bg-black/5" : "hover:bg-white/10")}
            >
              <Menu size={20} className={theme === 'light' ? "text-black" : "text-white"} />
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className={cn(
              "hidden md:flex items-center px-3 py-2 rounded-full border w-64 transition-colors",
              theme === 'light'
                ? "bg-black/5 border-transparent text-black focus-within:bg-white focus-within:border-black/20 focus-within:ring-2 focus-within:ring-black/5"
                : "bg-white/5 border-transparent text-white focus-within:bg-black focus-within:border-white/20 focus-within:ring-2 focus-within:ring-white/5"
            )}>
              <Search size={14} className="opacity-50 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-inherit"
              />
            </form>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-full transition-colors",
                theme === 'light' ? "hover:bg-black/5 text-black" : "hover:bg-white/10 text-white"
              )}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "p-2 rounded-full transition-colors relative",
                  theme === 'light' ? "hover:bg-black/5 text-black" : "hover:bg-white/10 text-white",
                  showNotifications && (theme === 'light' ? "bg-black/5" : "bg-white/10")
                )}
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={cn(
                      "absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-xl p-4 z-50",
                      theme === 'light' ? "bg-white border-black/5" : "bg-zinc-900 border-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn("font-bold text-sm", theme === 'light' ? "text-black" : "text-white")}>Notifications</span>
                      <span className="text-xs text-purple-500 font-medium cursor-pointer">Mark all read</span>
                    </div>
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <p className={cn("text-xs font-medium leading-tight mb-1", theme === 'light' ? "text-black" : "text-white")}>
                              New candidate application received for Senior Designer role.
                            </p>
                            <p className="text-[10px] opacity-50">2 mins ago</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-current opacity-10 mx-1"></div>

            <motion.button
              onClick={onCreateJob} // This already navigates to /dashboard/jobs/new from App.tsx prop
              whileTap={{ scale: 0.95 }}
              className={cn(
                "hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-transform",
                theme === 'light'
                  ? "bg-black text-white hover:bg-zinc-800"
                  : "bg-white text-black hover:bg-zinc-200"
              )}
            >
              <Plus size={16} />
              <span>Create Interview</span>
            </motion.button>
          </div>
        </header>

        {/* Workspace Content */}
        <div className={cn(
          "flex-1 p-6 lg:p-10 relative overflow-hidden",
          theme === 'light' ? "bg-white" : "bg-black"
        )}>
          {/* Background Pattern */}
          <div className={cn(
            "absolute inset-0 bg-purple-grid pointer-events-none",
            theme === 'light' ? "opacity-5" : "opacity-15"
          )} />

          <div className="relative z-10 max-w-6xl mx-auto">
            {children}
          </div>
        </div>

      </main>
    </div>
  );
};
