import { createClient } from '@supabase/supabase-js';

// Safe access to environment variables in various environments
const getEnv = (key: string): string | undefined => {
  let value: unknown;
  if (typeof process !== 'undefined' && process.env) {
    value = process.env[key];
  }
  // Fallback for some bundlers that use import.meta.env
  else if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    value = (import.meta as any).env[key];
  }

  return typeof value === 'string' ? value : undefined;
};

// 1. Use safe helper to retrieve environment variables (checking both NEXT_ and VITE_ prefixes)
const supabaseUrl = getEnv('NEXT_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

// Mock client to prevent errors when env vars are missing or invalid
const createMockClient = () => {
  const mockChannel = {
    on: () => mockChannel,
    subscribe: () => mockChannel,
    unsubscribe: () => { },
    off: () => mockChannel,
  };

  return {
    auth: {
      signInWithPassword: async ({ email }: { email: string }) => {
        console.log("Mock Login Success for:", email);
        return { data: { user: { email } }, error: null };
      },
      signInWithOAuth: async () => {
        return { data: { url: '#' }, error: null };
      },
      signUp: async ({ email }: { email: string }) => {
        console.log("Mock Signup Success for:", email);
        return { data: { user: { email } }, error: null };
      },
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    },
    channel: () => mockChannel,
    removeChannel: () => { },
    from: () => ({
      select: () => ({
        data: [],
        error: null
      })
    })
  } as any;
};

// Check if configured with valid HTTP URL
const isConfigured =
  !!(supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder'));

// 3. Create the real client or fallback to the mock client
export const supabase = isConfigured
  ? createClient(supabaseUrl as string, supabaseKey as string)
  : createMockClient();

if (!isConfigured) {
  console.log('Supabase credentials missing or invalid. Using mock client for demo mode / build mode.');
}

