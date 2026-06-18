import Fastify, { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { ApolloServer } from '@apollo/server';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import dotenv from 'dotenv';
import path from 'path';
import { prisma } from '@aicruiter/db';
import { queueCandidateReportJob } from './services/queue';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // Load .env from monorepo root

// Default fallback user ID for demo/dev purposes
const DEFAULT_USER_ID = 'demo-recruiter-id-123';

async function ensureUser(userId: string) {
  try {
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      let email = 'recruiter@example.com';
      let fullName = 'Demo Recruiter';
      let companyName = 'AIcruiter Inc.';
      let role = 'Lead Recruiter';
      let onboarded = true;

      const isDemo = userId === 'demo-recruiter-id-123';

      if (!isDemo) {
        onboarded = false;
        fullName = 'New Recruiter';
        companyName = 'Company Inc.';
        role = 'Hiring Manager';
        try {
          const authUsers: any[] = await (prisma as any).$queryRawUnsafe(
            `SELECT email, raw_user_meta_data FROM auth.users WHERE id = $1::uuid LIMIT 1`,
            userId
          );
          if (authUsers && authUsers.length > 0) {
            email = authUsers[0].email || 'new-user@example.com';
            const meta = authUsers[0].raw_user_meta_data;
            if (meta && typeof meta === 'object' && meta !== null) {
              fullName = meta.full_name || fullName;
            } else if (meta && typeof meta === 'string') {
              try {
                const parsed = JSON.parse(meta);
                fullName = parsed.full_name || fullName;
              } catch(e) {}
            }
          }
        } catch (err) {
          console.warn(`Could not query auth.users for ${userId}:`, err);
        }
      }

      user = await prisma.user.create({
        data: {
          id: userId,
          email,
          fullName,
          companyName,
          role,
          aiCredits: 100,
          onboarded,
        }
      });
    }
    return user;
  } catch (error) {
    console.error(`Failed to ensure user ${userId}:`, error);
    return null;
  }
}

const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    fullName: String
    role: String
    companyName: String
    website: String
    aiCredits: Int!
    onboarded: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Job {
    id: ID!
    userId: ID!
    title: String!
    jobRole: String
    description: String!
    durationMinutes: Int!
    interviewType: [String!]!
    experienceLevel: String!
    status: String!
    createdAt: String!
    updatedAt: String!
    candidateCount: Int!
    candidates: [Candidate!]
    user: User
  }

  type Candidate {
    id: ID!
    jobId: ID!
    name: String!
    email: String!
    status: String!
    resumeUrl: String
    metaData: String
    overallScore: Int
    createdAt: String!
    updatedAt: String!
    job: Job
  }

  type Activity {
    id: ID!
    userId: ID!
    type: String!
    message: String!
    subtitle: String
    timestamp: String!
    score: Int
  }

  type DashboardStats {
    totalCandidates: Int!
    activeJobs: Int!
    aiCredits: Int!
    timeSavedHours: Int!
  }

  type Query {
    me: User
    jobs: [Job!]!
    job(id: ID!): Job
    candidates(jobId: ID): [Candidate!]!
    activities: [Activity!]!
    dashboardStats: DashboardStats!
  }

  type Mutation {
    updateProfile(fullName: String, companyName: String, role: String, website: String): User!
    createJob(title: String!, description: String!, durationMinutes: Int, interviewType: [String!]): Job!
    updateJob(id: ID!, title: String, description: String, durationMinutes: Int, interviewType: [String!], status: String): Job!
    deleteJob(id: ID!): Boolean!
    updateCandidateStatus(id: ID!, status: String!): Candidate!
    
    createCandidate(jobId: ID!, name: String!, email: String!): Candidate!
    updateCandidateInterviewStatus(id: ID!, status: String!, metaData: String): Candidate!
    getDeepgramToken: String!
  }
`;

interface Context {
  userId: string;
}

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: Context) => {
      await ensureUser(context.userId);
      return prisma.user.findUnique({ where: { id: context.userId } });
    },
    jobs: async (_parent: any, _args: any, context: Context) => {
      await ensureUser(context.userId);
      return prisma.job.findMany({
        where: { userId: context.userId },
        orderBy: { createdAt: 'desc' }
      });
    },
    job: async (_parent: any, args: { id: string }) => {
      return prisma.job.findUnique({ where: { id: args.id } });
    },
    candidates: async (_parent: any, args: { jobId?: string }, context: Context) => {
      await ensureUser(context.userId);
      if (args.jobId) {
        return prisma.candidate.findMany({
          where: { jobId: args.jobId },
          orderBy: { createdAt: 'desc' }
        });
      }
      return prisma.candidate.findMany({
        where: { job: { userId: context.userId } },
        orderBy: { createdAt: 'desc' }
      });
    },
    activities: async (_parent: any, _args: any, context: Context) => {
      await ensureUser(context.userId);
      return prisma.activity.findMany({
        where: { userId: context.userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    },
    dashboardStats: async (_parent: any, _args: any, context: Context) => {
      await ensureUser(context.userId);
      const totalCandidates = await prisma.candidate.count({
        where: { job: { userId: context.userId } }
      });
      const activeJobs = await prisma.job.count({
        where: { userId: context.userId, status: 'ACTIVE' }
      });
      const user = await prisma.user.findUnique({
        where: { id: context.userId }
      });
      return {
        totalCandidates,
        activeJobs,
        aiCredits: user?.aiCredits || 0,
        timeSavedHours: Math.round(totalCandidates * 0.5)
      };
    }
  },

  Job: {
    candidateCount: async (parent: any) => {
      return prisma.candidate.count({ where: { jobId: parent.id } });
    },
    candidates: async (parent: any) => {
      return prisma.candidate.findMany({ where: { jobId: parent.id } });
    },
    user: async (parent: any) => {
      return prisma.user.findUnique({ where: { id: parent.userId } });
    }
  },

  Candidate: {
    job: async (parent: any) => {
      return prisma.job.findUnique({ where: { id: parent.jobId } });
    },
    metaData: (parent: any) => {
      if (!parent.metaData) return null;
      return typeof parent.metaData === 'string' ? parent.metaData : JSON.stringify(parent.metaData);
    },
    overallScore: (parent: any) => {
      if (parent.metaData && typeof parent.metaData === 'object') {
        return (parent.metaData as any).overallScore || (parent.metaData as any).score || 0;
      }
      return 0;
    }
  },

  Activity: {
    type: (parent: any) => parent.action || 'SYSTEM',
    message: (parent: any) => parent.details || 'Activity logged',
    subtitle: (parent: any) => null,
    score: (parent: any) => null,
    timestamp: (parent: any) => {
      return parent.createdAt.toISOString();
    }
  },

  Mutation: {
    updateProfile: async (_parent: any, args: any, context: Context) => {
      await ensureUser(context.userId);
      return prisma.user.update({
        where: { id: context.userId },
        data: {
          fullName: args.fullName ?? undefined,
          companyName: args.companyName ?? undefined,
          role: args.role ?? undefined,
          website: args.website ?? undefined,
        }
      });
    },
    createJob: async (_parent: any, args: any, context: Context) => {
      await ensureUser(context.userId);
      const job = await prisma.job.create({
        data: {
          userId: context.userId,
          title: args.title,
          jobRole: args.title,
          description: args.description,
          durationMinutes: args.durationMinutes || 15,
          interviewType: args.interviewType || ["Technical"],
          status: 'ACTIVE',
          experienceLevel: 'Mid-Level',
        }
      });

      await prisma.activity.create({
        data: {
          userId: context.userId,
          action: 'SYSTEM',
          details: `Created job: ${args.title}`
        }
      });

      return job;
    },
    updateJob: async (_parent: any, args: any) => {
      return prisma.job.update({
        where: { id: args.id },
        data: {
          title: args.title ?? undefined,
          description: args.description ?? undefined,
          durationMinutes: args.durationMinutes ?? undefined,
          interviewType: args.interviewType ?? undefined,
          status: args.status ?? undefined,
        }
      });
    },
    deleteJob: async (_parent: any, args: { id: string }) => {
      await prisma.job.delete({ where: { id: args.id } });
      return true;
    },
    updateCandidateStatus: async (_parent: any, args: { id: string; status: string }) => {
      return prisma.candidate.update({
        where: { id: args.id },
        data: { status: args.status }
      });
    },
    createCandidate: async (_parent: any, args: { jobId: string; name: string; email: string }) => {
      const existingCandidate = await prisma.candidate.findFirst({
        where: {
          jobId: args.jobId,
          email: args.email,
        }
      });

      if (existingCandidate) {
        if (existingCandidate.status === 'COMPLETED') {
          throw new Error("ALREADY_COMPLETED");
        }
        // If they registered but haven't finished, let them resume the same record.
        return existingCandidate;
      }

      return prisma.candidate.create({
        data: {
          jobId: args.jobId,
          name: args.name,
          email: args.email,
          status: 'STARTED',
        }
      });
    },
    updateCandidateInterviewStatus: async (_parent: any, args: { id: string; status: string; metaData?: string }) => {
      const candidate = await prisma.candidate.update({
        where: { id: args.id },
        data: {
          status: args.status,
          metaData: args.metaData ? JSON.parse(args.metaData) : undefined,
        }
      });

      if (args.status === 'COMPLETED') {
        // Trigger report generation (background SQS or local async)
        // We do not await it so it runs out-of-band/background without blocking GraphQL response
        queueCandidateReportJob(args.id).catch(err => {
          console.error(`Error triggering candidate report job for ${args.id}:`, err);
        });
      }

      return candidate;
    },
    getDeepgramToken: async () => {
      const apiKey = process.env.NEXT_DEEPGRAM_API_KEY || process.env.VITE_DEEPGRAM_API_KEY;
      if (!apiKey) throw new Error("Deepgram API key not configured on backend");

      try {
        // 1. Fetch project ID from Deepgram
        const projectRes = await fetch('https://api.deepgram.com/v1/projects', {
          headers: { 'Authorization': `Token ${apiKey}` }
        });
        if (!projectRes.ok) throw new Error("Failed to fetch projects from Deepgram");
        const projectsData: any = await projectRes.json();
        const projectId = projectsData.projects?.[0]?.project_id;
        if (!projectId) throw new Error("No project found on Deepgram account");

        // 2. Generate temporary key (TTL: 60s)
        const keyRes = await fetch(`https://api.deepgram.com/v1/projects/${projectId}/keys`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            comment: 'Temporary client STT key',
            scopes: ['usage:write'],
            time_to_live_in_seconds: 60
          })
        });
        if (!keyRes.ok) throw new Error("Failed to create temporary key");
        const keyData: any = await keyRes.json();
        return keyData.key;
      } catch (error: any) {
        console.warn("Deepgram token generation failed, falling back to main API key:", error.message || error);
        // Fallback to main API key for local dev / offline tests
        return apiKey;
      }
    }
  }
};

const startServer = async () => {
  const fastify = Fastify({ logger: true });

  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  const apollo = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin(fastify)],
  });

  await apollo.start();

  await fastify.register(fastifyApollo(apollo), {
    context: async (request: FastifyRequest) => {
      // Allow custom X-User-Id or Auth headers to simulate/identify users
      const rawUserId = request.headers['x-user-id'] || request.headers['authorization'];
      const userId = typeof rawUserId === 'string' ? rawUserId : DEFAULT_USER_ID;
      return { userId };
    }
  });

  fastify.get('/health', async () => {
    return { status: 'OK' };
  });

  fastify.post('/api/speak', async (request, reply) => {
    const { text } = request.body as { text: string };
    if (!text) {
      reply.status(400).send({ error: "Text parameter is required" });
      return;
    }

    const apiKey = process.env.NEXT_DEEPGRAM_API_KEY || process.env.VITE_DEEPGRAM_API_KEY;
    if (!apiKey) {
      reply.status(500).send({ error: "Deepgram API key not configured on backend" });
      return;
    }

    try {
      const response = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Deepgram TTS failed: ${response.status} - ${errText}`);
      }

      const buffer = await response.arrayBuffer();
      reply.header('Content-Type', 'audio/mpeg');
      reply.send(Buffer.from(buffer));
    } catch (err: any) {
      console.error("Backend TTS Error:", err);
      reply.status(500).send({ error: err.message || "Failed to generate speech" });
    }
  });

  fastify.post('/api/connect', async (request, reply) => {
    const dailyApiKey = process.env.DAILY_API_KEY;
    if (!dailyApiKey) {
      console.warn("DAILY_API_KEY not configured. Returning mock/dev room URL.");
      return {
        room_url: process.env.DAILY_ROOM_URL || "https://demo.daily.co/aicruiter-dev-room",
        token: "mock-token-123"
      };
    }

    try {
      // 1. Create a temporary Daily.co room
      const roomRes = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${dailyApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
          }
        })
      });

      if (!roomRes.ok) {
        const err = await roomRes.text();
        throw new Error(`Failed to create Daily room: ${roomRes.status} - ${err}`);
      }

      const roomData = await roomRes.json() as any;
      const roomUrl = roomData.url;
      const roomName = roomData.name;

      // 2. Create a meeting token for the client participant
      const tokenRes = await fetch('https://api.daily.co/v1/meeting-tokens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${dailyApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            is_owner: false,
          }
        })
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        throw new Error(`Failed to create Daily token: ${tokenRes.status} - ${err}`);
      }

      const tokenData = await tokenRes.json() as any;
      const token = tokenData.token;

      return {
        room_url: roomUrl,
        token: token
      };
    } catch (err: any) {
      console.warn("Failed to connect to Daily, falling back to mock room URL for development:", err.message || err);
      return {
        room_url: process.env.DAILY_ROOM_URL || "https://demo.daily.co/aicruiter-dev-room",
        token: "mock-token-123"
      };
    }
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  const host = process.env.HOST || '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();

