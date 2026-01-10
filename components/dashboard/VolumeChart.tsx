
import React from 'react';
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

const data = [
  { name: 'Mon', value: 45 },
  { name: 'Tue', value: 60 },
  { name: 'Wed', value: 75 },
  { name: 'Thu', value: 50 },
  { name: 'Fri', value: 90 },
  { name: 'Sat', value: 65 },
  { name: 'Sun', value: 80 },
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

  return (
    <div className={cn(
      "p-6 md:p-8 rounded-[2rem] border min-h-[400px] flex flex-col h-full",
      theme === 'light' ? "bg-white border-black/5" : "bg-black border-white/10"
    )}>
      <div className="flex items-center justify-between mb-8">
        <h3 className={cn("text-xl font-bold", theme === 'light' ? "text-black" : "text-white")}>
          Candidate Volume <span className={theme === 'light' ? "text-black/40" : "text-white/40"}>(Last 7 Days)</span>
        </h3>
        <button className={cn("p-2 rounded-full transition-colors", theme === 'light' ? "hover:bg-black/5" : "hover:bg-white/10")}>
          <MoreHorizontal className={theme === 'light' ? "text-black/40" : "text-white/40"} />
        </button>
      </div>
      
      <div className="flex-1 w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6D28D9" stopOpacity={0}/>
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
