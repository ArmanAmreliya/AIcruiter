
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

export interface ActivityItem {
  id: string | number;
  type: 'INTERVIEW' | 'APPLICATION' | 'AI' | string;
  title: string;
  subtitle?: string;
  createdAt: string;
  score?: number;
  avatarUrl?: string;
}

interface ActivityFeedProps {
  initialActivities: ActivityItem[];
}

export const ActivityFeed = ({ initialActivities }: ActivityFeedProps) => {
  const { theme } = useTheme();
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);

  // Real-time subscription hook
  useEffect(() => {
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Activity',
        },
        (payload) => {
          const newActivity = payload.new as ActivityItem;

          // Add to state and maintain max 5 items
          setActivities((prev) => [newActivity, ...prev].slice(0, 5));

          // Trigger toast
          toast.message("New Activity", {
            description: newActivity.title,
            action: {
              label: "View",
              onClick: () => console.log("View activity", newActivity.id),
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn(
      "p-6 md:p-8 rounded-[2rem] border h-full overflow-hidden flex flex-col",
      theme === 'light' ? "bg-white border-black/5" : "bg-black border-white/10"
    )}>
      <h3 className={cn("text-xl font-bold mb-6", theme === 'light' ? "text-black" : "text-white")}>
        Recent Activity
      </h3>

      <div className="space-y-6 relative">
        <AnimatePresence initial={false} mode="popLayout">
          {activities.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="relative z-10"
            >
              <div className="relative">
                {/* Connector Line (only if not last) */}
                {index !== activities.length - 1 && (
                  <div className={cn(
                    "absolute left-5 top-12 bottom-[-24px] w-px",
                    theme === 'light' ? "bg-black/5" : "bg-white/10"
                  )} />
                )}

                <div className="flex gap-4 items-start">
                  {/* Avatar */}
                  <div className="shrink-0 relative">
                    {item.avatarUrl ? (
                      <img
                        src={item.avatarUrl}
                        alt="Avatar"
                        className={cn(
                          "w-10 h-10 rounded-full object-cover border-2",
                          theme === 'light' ? "border-white" : "border-black"
                        )}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#6D28D9] flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                        <Sparkles size={16} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <p className={cn("text-sm font-bold mb-1 leading-snug", theme === 'light' ? "text-black" : "text-white")}>
                        {item.title}
                      </p>
                      <span className={cn("text-[10px] whitespace-nowrap", theme === 'light' ? "text-black/40" : "text-white/40")}>
                        {formatTime(item.createdAt)}
                      </span>
                    </div>

                    {/* Match Badge */}
                    {item.type === 'INTERVIEW' && item.score && (
                      <div className="mb-2">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          theme === 'light'
                            ? "bg-black text-white border-[#6D28D9]"
                            : "bg-white text-black border-[#6D28D9]"
                        )}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6D28D9] mr-1.5 animate-pulse"></span>
                          {item.score}% Match
                        </span>
                      </div>
                    )}

                    {item.subtitle && (
                      <p className={cn("text-xs truncate", theme === 'light' ? "text-black/60" : "text-white/60")}>
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {activities.length === 0 && (
          <div className="text-center py-10 opacity-50 text-sm">
            No recent activity
          </div>
        )}
      </div>

      <button
        onClick={() => { window.location.href = '/dashboard/candidates'; }} // Changed to candidates as activity page doesn't exist yet in the router I saw
        className={cn(
          "w-full mt-auto pt-6 py-3 rounded-xl text-sm font-bold transition-colors border border-dashed",
          theme === 'light'
            ? "border-black/20 text-black/60 hover:bg-black/5 hover:text-black"
            : "border-white/20 text-white/60 hover:bg-white/5 hover:text-white"
        )}>
        View All Activity
      </button>
    </div>
  );
};
