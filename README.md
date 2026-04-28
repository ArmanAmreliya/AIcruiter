<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AIcruiter

AIcruiter is a production-ready AI interview platform for recruiters. It automates candidate screening, manages interview sessions, and provides a polished recruiter dashboard plus a candidate-facing interview flow.

## Highlights

- Recruiter dashboard with job creation, candidate management, and real-time activity updates
- Candidate interview flow with lobby, system check, live interview room, and feedback capture
- AI interview agent powered by speech-to-text, LLM responses, and text-to-speech
- Supabase-backed authentication, data storage, and realtime updates
- Vite + React + Tailwind stack with optimized bundling and code splitting

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- Data: Supabase (Auth, Postgres, Realtime)
- AI: Deepgram (STT/TTS), Groq (LLM)
- Tooling: Zod, React Hook Form, Sonner, Lucide

## Architecture Overview

- App shell: [App.tsx](App.tsx#L1) wires routes, auth state, and lazy-loaded views
- Dashboard: recruiter-only views in [components/pages](components/pages)
- Candidate flow: lobby, live interview, and thank-you pages in [components/interview](components/interview)
- Data layer: Supabase client in [lib/supabase.ts](lib/supabase.ts#L1)
- AI runtime: interview agent hook in [hooks/useAIInterviewer.ts](hooks/useAIInterviewer.ts#L1)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (URL + anon key)
- Deepgram API key (for STT/TTS)
- Groq API key (for LLM responses)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DEEPGRAM_API_KEY=your_deepgram_api_key
VITE_GROQ_API_KEY=your_groq_api_key
# Optional (used by Vite defines and local experiments)
GEMINI_API_KEY=your_gemini_api_key
```

### 3) Run the app

```bash
npm run dev
```

Vite runs on `http://localhost:3001` by default.

## Supabase Setup

### Tables

This project expects these key tables in Supabase:

- `jobs`
- `candidates`
- `profiles`
- `activities`
- `interview_transcripts`

Refer to migration templates in [supabase/migrations](supabase/migrations) for an example `candidates` table and `jobs` extensions.

### Auth

Recruiter login and signup use Supabase Auth (email/password + Google OAuth).

## Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - production build
- `npm run preview` - preview the production build

## Deployment

This app is a standard Vite SPA. Build and deploy the `dist/` output to any static hosting provider.

```bash
npm run build
```

## Project Structure

```
app/                  Server actions (mocked for demo usage)
components/           UI, pages, sections, and interview flow
context/              Theme and demo providers
hooks/                Data and AI hooks
lib/                  Supabase client and env validation
prisma/               Prisma schema (optional, demo-only)
public/               Static assets
supabase/             SQL migrations for core tables
types/                App-wide TypeScript types
```

## Environment Notes

- `lib/env.ts` validates env variables at startup and fails fast for missing Supabase config.
- AI interview mode requires both Deepgram and Groq keys to run fully.
- The Prisma client in [lib/prisma.ts](lib/prisma.ts#L1) is currently mocked for demo environments.

## Troubleshooting

- Missing Supabase keys will throw an error on boot. Double-check `.env` values.
- If audio or mic access fails in the interview room, verify browser permissions.
- For empty dashboards, ensure the logged-in recruiter has records in `profiles` and `jobs`.

## License

This repository currently does not specify a license.
