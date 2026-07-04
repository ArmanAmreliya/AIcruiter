"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "../../lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  magnetic?: boolean;
  ripple?: boolean;
};

export const Button = ({
  children,
  variant = "primary",
  className,
  magnetic = true,
  ripple = true,
  onMouseMove,
  onMouseLeave,
  onClick,
  ...props
}: ButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLSpanElement | null>(null);
  const rippleRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const content = contentRef.current;

    if (!button || !content || !magnetic) return;

    const handlePointerMove = (event: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: x * 0.08,
        y: y * 0.08,
        duration: 0.25,
        ease: "power2.out",
      });

      gsap.to(content, {
        x: x * 0.04,
        y: y * 0.04,
        duration: 0.25,
        ease: "power2.out",
      });
    };

    const handlePointerLeave = () => {
      gsap.to([button, content], {
        x: 0,
        y: 0,
        duration: 0.35,
        ease: "power3.out",
      });
    };

    button.addEventListener("mousemove", handlePointerMove);
    button.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      button.removeEventListener("mousemove", handlePointerMove);
      button.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [magnetic]);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!ripple || !rippleRef.current || !buttonRef.current) return;

    const button = buttonRef.current;
    const rippleEl = rippleRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    gsap.killTweensOf(rippleEl);
    gsap.set(rippleEl, {
      width: size,
      height: size,
      x,
      y,
      opacity: 0.24,
      scale: 0,
    });
    gsap.to(rippleEl, {
      scale: 1,
      opacity: 0,
      duration: 0.65,
      ease: "power2.out",
    });
  };

  const baseStyles =
    "group relative inline-flex items-center justify-center px-6 py-3 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden will-change-transform hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]";
  const variants = {
    primary:
      "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
    outline:
      "border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5",
    ghost: "hover:bg-gray-100 dark:hover:bg-white/10",
  };

  return (
    <button
      ref={buttonRef}
      className={cn(baseStyles, variants[variant], className)}
      onMouseMove={(e) => onMouseMove?.(e)}
      onMouseLeave={(e) => onMouseLeave?.(e)}
      onClick={(e) => {
        createRipple(e);
        onClick?.(e);
      }}
      {...props}
    >
      <span
        ref={rippleRef}
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full bg-white/35 dark:bg-purple-300/25"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.16)_35%,transparent_70%)]"
      />
      <span
        ref={contentRef}
        className="relative z-10 inline-flex items-center justify-center"
      >
        {children}
      </span>
    </button>
  );
};
