
import { z } from 'zod';

const envSchema = z.object({
    VITE_SUPABASE_URL: z.string().url("VITE_SUPABASE_URL must be a valid URL"),
    VITE_SUPABASE_ANON_KEY: z.string().min(1, "VITE_SUPABASE_ANON_KEY is required"),
    // Include other specific variables if known, e.g. based on vite.config.ts or usage
    GEMINI_API_KEY: z.string().optional(),
});

// Use import.meta.env directly for validation
const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
    console.error(
        '❌ Invalid environment variables:',
        JSON.stringify(parsed.error.format(), null, 4)
    );
    // Throw an error to crash the app immediately (Fail Fast)
    throw new Error('Invalid environment variables');
}

export const env = parsed.data;
