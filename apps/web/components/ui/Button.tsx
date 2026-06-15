
import React from 'react';
import { cn } from '../../lib/utils';

export const Button = ({ children, variant = 'primary', className, ...props }: any) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
    outline: "border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5",
    ghost: "hover:bg-gray-100 dark:hover:bg-white/10",
  };

  return (
    <button className={cn(baseStyles, variants[variant as keyof typeof variants], className)} {...props}>
      {children}
    </button>
  );
};
