
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Video, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

export const Sidebar = () => {
  const { theme } = useTheme();

  const links = [
    { name: 'Overview', href: '/dashboard', icon: LayoutGrid },
    { name: 'Interviews', href: '/dashboard/jobs', icon: Video },
    { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings }
  ];

  return (
    <aside className={cn(
      "flex flex-col h-full border-r transition-colors duration-300 w-[280px]",
      theme === 'light' ? "bg-white border-black/5" : "bg-black border-white/10"
    )}>
      {/* Logo Section */}
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
            className="transition-all duration-300"
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

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        <div className={cn("px-4 text-xs font-bold uppercase tracking-wider mb-2", theme === 'light' ? "text-black/40" : "text-white/40")}>
          Menu
        </div>
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.href}
            end={link.href === '/dashboard'}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative",
              isActive
                ? theme === 'light'
                  ? "bg-black text-white shadow-lg shadow-black/5"
                  : "bg-white text-black shadow-lg shadow-white/5"
                : theme === 'light'
                  ? "text-gray-500 hover:bg-black/5 hover:text-black"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
            )}
          >
            <link.icon size={20} className="shrink-0" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer: User Profile & Logout */}
      <div className={cn("p-4 border-t mt-auto", theme === 'light' ? "border-black/5" : "border-white/10")}>
         <div className={cn(
           "p-3 rounded-xl flex items-center gap-3 mb-3",
           theme === 'light' ? "bg-gray-50" : "bg-white/5"
         )}>
            <img
              src="https://i.pravatar.cc/150?u=alex"
              alt="User"
              className="w-9 h-9 rounded-full bg-gray-200 object-cover"
            />
            <div className="flex-1 min-w-0">
               <p className={cn("text-sm font-bold truncate", theme === 'light' ? "text-black" : "text-white")}>Alex Morgan</p>
               <p className={cn("text-xs truncate", theme === 'light' ? "text-black/50" : "text-white/50")}>alex@aicruiter.com</p>
            </div>
         </div>

         <NavLink
           to="/login"
           className={cn(
             "w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
             theme === 'light'
               ? "text-red-600 hover:bg-red-50"
               : "text-red-400 hover:bg-red-900/20"
           )}
         >
           <LogOut size={16} />
           Sign Out
         </NavLink>
      </div>
    </aside>
  );
};
