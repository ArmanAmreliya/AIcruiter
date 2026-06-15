'use client';

import React from 'react';
import { useRouter, useParams as useNextParams, usePathname, useSearchParams as useNextSearchParams } from 'next/navigation';
import NextLink from 'next/link';

export function useNavigate() {
  const router = useRouter();
  return (to: any, options?: any) => {
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useParams<T extends Record<string, string | string[]> = Record<string, string | string[]>>(): Partial<T> {
  const params = useNextParams() || {};
  const result = { ...params } as any;
  if (result.uniqueId && !result.jobId) {
    result.jobId = result.uniqueId;
  }
  if (result.jobId && !result.uniqueId) {
    result.uniqueId = result.jobId;
  }
  return result as unknown as Partial<T>;
}

export function useLocation() {
  const pathname = usePathname();
  return {
    pathname: pathname || '',
    search: '',
    hash: '',
    state: null as any,
  };
}

export function useSearchParams() {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const setParams = (newParams: any) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    for (const [key, value] of Object.entries(newParams)) {
      if (value === undefined || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return [searchParams || new URLSearchParams(), setParams] as const;
}

export function Link({ to, children, className, style, ...props }: any) {
  return (
    <NextLink href={to} className={className} style={style} {...props}>
      {children}
    </NextLink>
  );
}

interface NavLinkMockProps {
  to: string;
  children?: React.ReactNode;
  className?: string | ((props: { isActive: boolean }) => string | undefined);
  activeClassName?: string;
  style?: React.CSSProperties | ((props: { isActive: boolean }) => React.CSSProperties);
  [key: string]: any;
}

export function NavLink({ to, children, className, activeClassName, style, ...props }: NavLinkMockProps) {
  const pathname = usePathname();
  const isActive = pathname === to;
  const combinedClass = typeof className === 'function' 
    ? className({ isActive }) 
    : `${className || ''} ${isActive ? activeClassName || 'active' : ''}`;

  return (
    <NextLink href={to} className={combinedClass} style={style as any} {...props}>
      {children}
    </NextLink>
  );
}
