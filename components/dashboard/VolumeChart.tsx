
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const data7d = [
  { name: 'Mon', value: 45 },
  { name: 'Tue', value: 60 },
  { name: 'Wed', value: 75 },
  { name: 'Thu', value: 50 },
  { name: 'Fri', value: 90 },
  { name: 'Sat', value: 65 },
  { name: 'Sun', value: 80 },
];

const data30d = [
  { name: 'Week 1', value: 320 },
  { name: 'Week 2', value: 450 },
  { name: 'Week 3', value: 400 },
  { name: 'Week 4', value: 580 },
];

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={cn(
        "px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md",
        theme === 'light'
          ? "bg-white/90 border-black/5 text-black"
          : "bg-black/90 border-white/10 text-white"
      )}>
        <p className="text-sm font-bold mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#6D28D9]"></span>
          <p className="text-[#6D28D9] text-sm font-medium">
            {payload[0].value} Candidates
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const VolumeChart = () => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [showMenu, setShowMenu] = useState(false);

  const data = timeRange === '7d' ? data7d : data30d;

  return (
    <div className={cn(
      "p-6 md:p-8 rounded-[2rem] border min-h-[400px] flex flex-col h-full relative",
      theme === 'light' ? "bg-white border-black/5" : "bg-black border-white/10"
    )}>
      <div className="flex items-center justify-between mb-8 relative z-20">
        <h3 className={cn("text-xl font-bold", theme === 'light' ? "text-black" : "text-white")}>
          Candidate Volume <span className={theme === 'light' ? "text-black/40" : "text-white/40"}>
            ({timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'})
          </span>
        </h3>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={cn(
              "p-2 rounded-full transition-colors",
              theme === 'light' ? "hover:bg-black/5" : "hover:bg-white/10",
              showMenu && (theme === 'light' ? "bg-black/5" : "bg-white/10")
            )}
          >
            <MoreHorizontal className={theme === 'light' ? "text-black/40" : "text-white/40"} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-xl py-2 z-50",
                  theme === 'light' ? "bg-white border-black/5" : "bg-zinc-900 border-white/10"
                )}
              >
                <button
                  onClick={() => { setTimeRange('7d'); setShowMenu(false); }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
                    theme === 'light' ? "hover:bg-black/5 text-black" : "hover:bg-white/10 text-white",
                    timeRange === '7d' && "text-purple-600"
                  )}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => { setTimeRange('30d'); setShowMenu(false); }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
                    theme === 'light' ? "hover:bg-black/5 text-black" : "hover:bg-white/10 text-white",
                    timeRange === '30d' && "text-purple-600"
                  )}
                >
                  Last 30 Days
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6D28D9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip
              content={<CustomTooltip theme={theme} />}
              cursor={{ stroke: '#6D28D9', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6D28D9"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPurple)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
