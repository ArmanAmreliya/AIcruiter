# AIcruiter V2 Codebase & Architecture Guide

Welcome to the **AIcruiter V2** codebase guide. This document details the serverless modular monorepo architecture, workspace packaging, database schemas, real-time audio pipeline, background evaluation workers, and the custom Next.js routing adapters.

---

## 🗺️ Architectural Topology

AIcruiter V2 is structured as a **Serverless Modular Monolith (Lambdalith)** managed via **Turborepo** and **pnpm workspaces**.

```mermaid
graph TD
    User([Candidate / Recruiter]) -->|HTTPS| Vercel[Vercel - Next.js Web App]
    User -->|Direct WS Audio Bypass| Deepgram[Deepgram Nova-2 WS]
    Vercel -->|GraphQL API /graphql| APIGW[AWS API Gateway]
    APIGW -->|Serverless Trigger| LambdaCore[AWS Lambda - Fastify Monolith]
    
    LambdaCore -->|Queries| Supavisor[Supabase Connection Pooler]
    Supavisor -->|SQL| Postgres[(Supabase PostgreSQL)]
    
    LambdaCore -->|Queue Tasks| SQS[AWS SQS Queue]
    SQS -->|SQS Trigger| LambdaWorker[AWS Lambda - Background Worker]
    LambdaWorker -->|Groq LLM / Prisma updates| Postgres
```

---

## 📂 Repository Directory Tree

The codebase is organized into isolated applications under `apps/` and shared configuration/libraries under `packages/`:

```text
c:\Projects\AIcruiter\AIcruiter/
├── package.json                   # Monorepo root scripts & configuration
├── turbo.json                     # Turborepo task runner pipeline definitions
├── pnpm-workspace.yaml            # Workspace configurations for pnpm
├── apps/
│   ├── web/                       # Next.js 16 (App Router + Client Components)
│   └── api/                       # Fastify Node.js GraphQL Gateway (AWS Lambda Docker)
└── packages/
    ├── db/                        # Prisma client, migrations, & database connectors
    └── types/                     # Shared Zod validation schemas & TypeScript types
```

---

## 📦 Workspace Package Deep Dive

### 1. Root Orchestrator
- **Root config**: [`package.json`](file:///c:/Projects/AIcruiter/AIcruiter/package.json) & [`pnpm-workspace.yaml`](file:///c:/Projects/AIcruiter/AIcruiter/pnpm-workspace.yaml)
- **Task pipeline**: [`turbo.json`](file:///c:/Projects/AIcruiter/AIcruiter/turbo.json)
  - Configures build cache dependencies. Building `@aicruiter/api` and `@aicruiter/web` automatically triggers builds on the local workspace dependencies `@aicruiter/db` and `@aicruiter/types`.

### 2. Database Layer ([`packages/db`](file:///c:/Projects/AIcruiter/AIcruiter/packages/db))
Exposes the centralized database connection client to prevent connection exhaustion.
- **Client exporter**: [`index.ts`](file:///c:/Projects/AIcruiter/AIcruiter/packages/db/index.ts)
  - Exports a cached instance of `PrismaClient` configured with environment connection pool properties.
- **Prisma Schema**: [`prisma/schema.prisma`](file:///c:/Projects/AIcruiter/AIcruiter/packages/db/prisma/schema.prisma)
  - Connects to Supabase PostgreSQL using the Supavisor connection pooler (`port 6543`, transaction mode with `pgbouncer=true`).
  - Uses direct connections (`port 5432`, session mode) for schema migrations and DB pushing.

### 3. Shared Types Layer ([`packages/types`](file:///c:/Projects/AIcruiter/AIcruiter/packages/types))
Shares critical schemas and data validators to align frontend validation with API endpoint security.
- **Validators**: [`index.ts`](file:///c:/Projects/AIcruiter/AIcruiter/packages/types/index.ts)
  - `onboardingSchema` / `OnboardingData`: Validates recruiter onboarding profiles.
  - `jobCreationSchema` / `JobCreationData`: Ensures job details and duration bounds are checked.
  - `candidateRegistrationSchema` / `CandidateRegistrationData`: Validates candidate sign-ins.

### 4. API Backend ([`apps/api`](file:///c:/Projects/AIcruiter/AIcruiter/apps/api))
Runs Fastify with an integrated Apollo GraphQL Server.
- **Main Server Gateway**: [`src/server.ts`](file:///c:/Projects/AIcruiter/AIcruiter/apps/api/src/server.ts)
  - Binds GraphQL queries and mutations (`me`, `jobs`, `candidates`, `createJob`, `updateCandidateInterviewStatus`).
  - Configures the `getDeepgramToken` mutation, which communicates with Deepgram to generate short-lived, low-permission client credentials.
  - Context hook automatically parses incoming auth headers to match dynamic recruiter profiles (`x-user-id` fallback).
- **Serverless Docker Packaging**: [`Dockerfile`](file:///c:/Projects/AIcruiter/AIcruiter/apps/api/Dockerfile)
  - Packages the Fastify monorail with the **AWS Lambda Web Adapter** binary. This translates standard REST/HTTP traffic to serverless HTTP event payloads, allowing standard Web servers to run unchanged inside Lambda.

### 5. Next.js Frontend ([`apps/web`](file:///c:/Projects/AIcruiter/AIcruiter/apps/web))
Next.js App Router workspace utilizing React Server Components.
- **Dynamic Routing Structure**:
  - Unified dynamic segment routes inside [`app/interview/[jobId]/`](file:///c:/Projects/AIcruiter/AIcruiter/apps/web/app/interview/[jobId]):
    - `page.tsx`: Renders the live interview lobby [`InterviewLobby.tsx`](file:///c:/Projects/AIcruiter/AIcruiter/apps/web/components/interview/InterviewLobby.tsx).
    - `room/page.tsx`: Renders the candidate audio screening room [`InterviewRoom.tsx`](file:///c:/Projects/AIcruiter/AIcruiter/apps/web/components/interview/InterviewRoom.tsx).
- **Navigation & Routing Adapter**: [`lib/react-router-dom-compat.tsx`](file:///c:/Projects/AIcruiter/AIcruiter/apps/web/lib/react-router-dom-compat.tsx)
  - Translates and resolves traditional React Router calls (`useNavigate`, `useParams`, `useLocation`) into Next.js App Router hooks (`useRouter`, `useParams`, `usePathname`).
  - Implicitly maps and reconciles dynamic routing parameters (`uniqueId` vs `jobId`) to allow legacy routing variables to work correctly.
- **Flexible Key Loader**: [`lib/supabase.ts`](file:///c:/Projects/AIcruiter/AIcruiter/apps/web/lib/supabase.ts)
  - Loads credentials flexibly, scanning both Next.js environment layouts (`NEXT_SUPABASE_URL`) and Vite standard configurations (`VITE_SUPABASE_URL`).
  - Gracefully falls back to a sandbox mockup client during build/prerendering phases to prevent build crashes in production pipelines.

---

## 🗄️ Database Schema & Relations

```mermaid
erDiagram
    User ||--o{ Job : creates
    User ||--o{ Activity : logs
    Job ||--o{ Candidate : screens
    Job ||--o{ InterviewTranscript : records
    Candidate ||--o{ InterviewTranscript : speaks
    
    User {
        string id PK
        string email
        string fullName
        string role
        string companyName
        int aiCredits
        boolean onboarded
    }
    
    Job {
        string id PK
        string userId FK
        string title
        string description
        int durationMinutes
        string[] interviewType
        string experienceLevel
        string status
    }
    
    Candidate {
        string id PK
        string jobId FK
        string name
        string email
        string status
        json metaData
    }
    
    InterviewTranscript {
        string id PK
        string jobId FK
        string candidateId FK
        string userText
        string aiText
    }
    
    Activity {
        string id PK
        string userId FK
        string action
        string details
    }
```

---

## 🎙️ Voice & Audio Pipeline (Deepgram Bypass)

To optimize costs and server resources, AIcruiter streams audio directly from the user's browser to Deepgram, avoiding middleman server proxies.

```
+------------------+                   +------------------+
|                  |  GraphQL Token    |                  |
|  Recruiter/Cand  | <===============> |   Fastify API    |
|     Browser      |    (60s TTL)      |  (GraphQL Gate)  |
|                  |                   +------------------+
|                  |
|  Stream WebAudio |
|  Direct via WS   |
|                  |                   +------------------+
|                  | =================>|     Deepgram     |
|                  |                   |  ( Nova-2 / Aura)|
+------------------+                   +------------------+
```

1. **Token Retrieval**: The candidate page calls `getDeepgramToken` GraphQL mutation. The backend server uses the master API key to issue a temporary (60s TTL), restricted token (`usage:write` permission only) from the Deepgram API.
2. **WebSocket Handshake**: The custom React hook [`useAIInterviewer.ts`](file:///c:/Projects/AIcruiter/AIcruiter/apps/web/hooks/useAIInterviewer.ts) opens a native WebSocket connection to `wss://api.deepgram.com/v1/listen` using the temporary token.
3. **Real-time Streaming**: Media chunks captured by the microphone (`MediaRecorder`) are sent directly to Deepgram over the WebSocket connection.
4. **Text-to-Speech**: Speech generation requests utilize the same token via browser `fetch` to Deepgram's Aura TTS API, keeping raw API credentials safe and secure.

---

## ⚙️ Asynchronous Processing & SQS Queues

When an interview status transitions to `'COMPLETED'`, the platform generates an AI-powered candidate evaluation report.

1. **Mutation Trigger**: The `updateCandidateInterviewStatus` GraphQL mutation in [`server.ts`](file:///c:/Projects/AIcruiter/AIcruiter/apps/api/src/server.ts) triggers the queue publisher [`queue.ts`](file:///c:/Projects/AIcruiter/AIcruiter/apps/api/src/services/queue.ts).
2. **Dynamic Queue Dispatch**:
   - **Production (AWS)**: The publisher pushes a message containing the `candidateId` payload to an SQS Queue using `@aws-sdk/client-sqs`.
   - **Local fallback**: If `AWS_SQS_QUEUE_URL` is not found, the publisher schedules processing locally in-memory via `setImmediate`, ensuring a seamless development workflow.
3. **AI Evaluation Worker**: [`report-worker.ts`](file:///c:/Projects/AIcruiter/AIcruiter/apps/api/src/services/report-worker.ts) fetches candidate information and dialogue transcripts, then calls the Groq Llama-3 API to assess match scoring and generate feedback. The results are parsed and saved to candidate metadata in the database.

---

## 🛠️ Developer Setup & Commands

### Prerequisites
- Node 18+
- pnpm 9+
- Supabase Project DB instances & API key configurations.

### Configuration
Create a `.env` file at the root directory of the monorepo:
```env
DATABASE_URL="postgresql://[user].[ref]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://[user].[ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres"

NEXT_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_SUPABASE_ANON_KEY="your-anon-publishable-key"

NEXT_GROQ_API_KEY="gsk_..."
NEXT_DEEPGRAM_API_KEY="your-deepgram-api-key"
```

### Dev Commands
```bash
# Install all workspace dependencies
pnpm install

# Apply database schemas to Supabase Postgres
pnpm --filter @aicruiter/db db:push

# Build all workspace applications
pnpm run build

# Start local dev environments (Next.js on 3000, GraphQL on 4000)
pnpm run dev
```
