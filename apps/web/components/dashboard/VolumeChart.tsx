
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

export const VolumeChart = ({ candidates = [] }: { candidates?: any[] }) => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [showMenu, setShowMenu] = useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 });

  React.useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 500,
          height: 300
        });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    
    resizeObserver.observe(containerRef.current);
    updateSize(); // Set initial dimensions

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const get7DaysData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      
      const count = candidates.filter(c => {
        const cDate = new Date(c.createdAt);
        return cDate.toDateString() === d.toDateString();
      }).length;
      
      data.push({ name: dayName, value: count });
    }
    
    return data;
  };

  const get30DaysData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const start = new Date();
      start.setDate(now.getDate() - (i + 1) * 7);
      const end = new Date();
      end.setDate(now.getDate() - i * 7);
      
      const count = candidates.filter(c => {
        const cDate = new Date(c.createdAt);
        return cDate >= start && cDate < end;
      }).length;
      
      data.push({ name: `Week ${4 - i}`, value: count });
    }
    
    return data;
  };

  const data = timeRange === '7d' ? get7DaysData() : get30DaysData();

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

      <div ref={containerRef} className="w-full h-[300px] relative flex items-center justify-center">
        {dimensions.width === 0 ? (
          <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        ) : (
          <AreaChart data={data} width={dimensions.width} height={dimensions.height} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
        )}
      </div>
    </div>
  );
};
