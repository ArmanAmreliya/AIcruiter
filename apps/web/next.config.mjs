import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from monorepo root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // NOTE: Do NOT add output: "standalone" or outputFileTracingRoot here.
  // Vercel manages its own output format. Standalone mode causes MIDDLEWARE_INVOCATION_FAILED
  // and 404 errors on both localhost and production.
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_SUPABASE_URL: process.env.NEXT_SUPABASE_URL,
    NEXT_SUPABASE_ANON_KEY: process.env.NEXT_SUPABASE_ANON_KEY,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    NEXT_GROQ_API_KEY: process.env.NEXT_GROQ_API_KEY,
    VITE_GROQ_API_KEY: process.env.VITE_GROQ_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    NEXT_AI_API_KEY: process.env.NEXT_AI_API_KEY,
    VITE_AI_API_KEY: process.env.VITE_AI_API_KEY,
    NEXT_DEEPGRAM_API_KEY: process.env.NEXT_DEEPGRAM_API_KEY,
    NEXT_REPORT_API_KEY: process.env.NEXT_REPORT_API_KEY,
    DAILY_ROOM_URL: process.env.DAILY_ROOM_URL,
  },
};

export default nextConfig;
