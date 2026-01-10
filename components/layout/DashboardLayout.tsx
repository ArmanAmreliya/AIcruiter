
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  Settings, 
  Menu, 
  X, 
  Plus, 
  Bell, 
  Search,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  onLogout: () => void;
  onCreateJob: () => void;
}

interface SidebarItemProps { 
  icon: any; 
  label: string; 
  active?: boolean; 
  onClick?: () => void;
  theme: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick,
  theme 
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 mb-1",
        active 
          ? theme === 'light' 
            ? "bg-black text-white shadow-lg" 
            : "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          : theme === 'light'
            ? "text-black/60 hover:text-black hover:bg-black/5"
            : "text-white/60 hover:text-white hover:bg-white/10"
      )}
    >
      <Icon size={20} />
      <span>{label}</span>
      {active && (
        <motion.div 
          layoutId="activeIndicator"
          className={cn(
            "ml-auto w-1.5 h-1.5 rounded-full",
            theme === 'light' ? "bg-white" : "bg-black"
          )} 
        />
      )}
    </motion.button>
  );
};

export const DashboardLayout = ({ children, onLogout, onCreateJob }: DashboardLayoutProps) => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'interviews', label: 'Interviews', icon: Video },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-8">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center border",
          theme === 'light' ? "bg-black border-black" : "bg-white border-white"
        )}>
          <img 
            width="24" 
            height="24" 
            src="https://img.icons8.com/forma-thin/96/7950F2/bot.png" 
            alt="Logo" 
            className="filter invert grayscale contrast-200"
            style={{ filter: theme === 'light' ? 'invert(1)' : 'invert(0)' }}
          />
        </div>
        <div>
          <h2 className={cn("font-bold text-lg tracking-tight", theme === 'light' ? "text-black" : "text-white")}>
            AIcruiter
          </h2>
          <p className={cn("text-xs font-medium", theme === 'light' ? "text-black/50" : "text-white/50")}>
            Enterprise
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar">
        <div>
          <p className={cn("px-4 text-xs font-bold uppercase tracking-wider mb-4", theme === 'light' ? "text-black/40" : "text-white/40")}>
            Menu
          </p>
          <nav>
            {navItems.map((item) => (
              <SidebarItem 
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                theme={theme}
              />
            ))}
          </nav>
        </div>

        <div>
          <p className={cn("px-4 text-xs font-bold uppercase tracking-wider mb-4", theme === 'light' ? "text-black/40" : "text-white/40")}>
            Team
          </p>
          <div className="space-y-3 px-4">
             {[1, 2, 3].map((i) => (
               <div key={i} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <img src={`https://i.pravatar.cc/150?u=${i + 20}`} className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>
                  </div>
                  <span className={cn("text-sm font-medium transition-colors", theme === 'light' ? "text-black/60 group-hover:text-black" : "text-white/60 group-hover:text-white")}>
                    Design Team
                  </span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className={cn("p-4 border-t", theme === 'light' ? "border-black/5" : "border-white/10")}>
         <div className={cn(
           "p-4 rounded-2xl flex items-center gap-3 mb-2",
           theme === 'light' ? "bg-black/5" : "bg-white/5"
         )}>
            <img src="https://i.pravatar.cc/150?u=user" className="w-9 h-9 rounded-full bg-gray-200" />
            <div className="flex-1 min-w-0">
               <p className={cn("text-sm font-bold truncate", theme === 'light' ? "text-black" : "text-white")}>Alex Morgan</p>
               <p className={cn("text-xs truncate", theme === 'light' ? "text-black/50" : "text-white/50")}>alex@aicruiter.com</p>
            </div>
         </div>
         <button 
           onClick={onLogout}
           className={cn(
             "w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
             theme === 'light' 
               ? "text-red-600 hover:bg-red-50" 
               : "text-red-400 hover:bg-red-900/20"
           )}
         >
           <LogOut size={16} />
           Sign Out
         </button>
      </div>
    </div>
  );

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
        <SidebarContent />
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
              <SidebarContent />
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
             <div className={cn(
               "hidden md:flex items-center px-3 py-2 rounded-full border w-64 transition-colors",
               theme === 'light' 
                 ? "bg-black/5 border-transparent text-black focus-within:bg-white focus-within:border-black/20 focus-within:ring-2 focus-within:ring-black/5" 
                 : "bg-white/5 border-transparent text-white focus-within:bg-black focus-within:border-white/20 focus-within:ring-2 focus-within:ring-white/5"
             )}>
                <Search size={14} className="opacity-50 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search candidates..." 
                  className="bg-transparent border-none outline-none text-sm w-full placeholder:text-inherit"
                />
             </div>
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
             
             <button 
               className={cn(
                 "p-2 rounded-full transition-colors relative",
                 theme === 'light' ? "hover:bg-black/5 text-black" : "hover:bg-white/10 text-white"
               )}
             >
               <Bell size={20} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
             </button>

             <div className="h-6 w-px bg-current opacity-10 mx-1"></div>

             <motion.button
               onClick={onCreateJob}
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
