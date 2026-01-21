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

// 1. Force the use of Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. FAIL FAST: If keys are missing, throw an error immediately.
// This prevents the "infinite loading" bug by ensuring we never use a fake client.
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "🔴 MISSING SUPABASE KEYS: Check your .env file.\n" +
    "Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set."
  );
}

// 3. Create the real client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Mock client to prevent "Failed to fetch" errors when env vars are missing or invalid
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
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder');

// export const supabase = isConfigured
//   ? createClient(supabaseUrl as string, supabaseKey as string)
//   : createMockClient();

if (!isConfigured) {
  console.log('Supabase credentials missing or invalid. Using mock client for demo mode.');
}
