# 🤖 AIcruiter — The AI Assistant for initial Candidate Screenings

AIcruiter is a modern, production-ready **AI Voice Agent & Applicant Screening Platform** that automates initial job interviews. It conducts real-time voice conversations, evaluates qualifications, and delivers instant candidate match reports directly to recruiters.

![AIcruiter Dashboard](docs/screenshots/Screenshot-img.png)

---

## ✨ Why AIcruiter?

- **🎙️ Conversational Initial Screenings**: Conducts natural, voice-driven screening interviews using customized persona agents with synced genders and voice accents.
- **💼 Instant Recruiter Insights**: Delivers match gauge scores, interview metrics, and detailed AI feedback summaries instantly to recruiter portals.
- **⚡ Cost-Saving Direct Audio Bypass**: Streams microphone audio from candidate browsers directly to Deepgram's voice APIs via short-lived WebSocket tokens, cutting latency and server resource usage.
- **🔍 Intelligent Skills Autocomplete**: Recruiter-focused, LinkedIn-style skill picker with search autocomplete, custom skill entries, and badge lists.
- **📊 Optimized Evaluation Pipeline**: Cleans conversational fillers (um, uh, like) and greetings out of transcripts before evaluating profiles, saving API tokens.

---

## 🗺️ Monorepo Overview

AIcruiter is structured as a **Serverless Modular Monolith (Lambdalith)** managed via **Turborepo** and **pnpm workspaces**:

- `apps/web/`: A responsive Next.js client app utilizing React Server Components & Tailwind.
- `apps/api/`: Fastify gateway exposing GraphQL schemas, deployed inside AWS Lambda.
- `packages/db/`: Shared PostgreSQL & Prisma model configurations.
- `packages/types/`: Shared Zod validation schemas.

For a deep dive into schemas, WebSocket audio bypass handshake details, and AWS infrastructure topology, please read the [Codebase Guide](CODEBASE_GUIDE.md).

---

## 🚀 Quick Start for Developers

### Prerequisites
- Node 18+ & pnpm 9+
- Supabase Project PostgreSQL database, Groq API key, and Deepgram API key.

### 1) Configuration
Create a `.env` file at the root directory of the monorepo:
```env
DATABASE_URL="postgresql://[user].[ref]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://[user].[ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres"
NEXT_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_SUPABASE_ANON_KEY="your-anon-publishable-key"
NEXT_GROQ_API_KEY="gsk_..."
NEXT_DEEPGRAM_API_KEY="your-deepgram-api-key"
```

### 2) Run the workspace
```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @aicruiter/db db:push

# Start client & server dev environments
pnpm run dev
```
- Recruiter portal and candidate room run on `http://localhost:3000`.
- GraphQL backend runs on `http://localhost:4000`.
