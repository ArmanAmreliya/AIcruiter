import Fastify, { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { ApolloServer } from '@apollo/server';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import dotenv from 'dotenv';
import path from 'path';
import { prisma } from '@aicruiter/db';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { queueCandidateReportJob } from './services/queue';
import { sendEmail } from './services/mail';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // Load .env from monorepo root

// Initialize Clerk Backend Client
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Default fallback user ID for demo/dev purposes
const DEFAULT_USER_ID = 'demo-recruiter-id-123';

async function ensureUser(userId: string) {
  try {
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const isDemo = userId === 'demo-recruiter-id-123';
      let email = isDemo ? 'recruiter@example.com' : `${userId}@placeholder.aicruiter.com`;
      let fullName = 'Demo Recruiter';
      let companyName = 'AIcruiter Inc.';
      let role = 'Lead Recruiter';
      let onboarded = true;

      if (!isDemo) {
        onboarded = false;
        fullName = 'New Recruiter';
        companyName = 'Company Inc.';
        role = 'Hiring Manager';
        
        if (userId.startsWith('user_')) {
          try {
            const clerkUser = await clerkClient.users.getUser(userId);
            email = clerkUser.emailAddresses[0]?.emailAddress || email;
            fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || fullName;
          } catch (err) {
            console.warn(`Could not query Clerk users for ${userId}:`, err);
          }
        }
      }

      // Resolve email duplicate conflicts to prevent unique constraint violations
      const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
      if (existingUserByEmail && existingUserByEmail.id !== userId) {
        const parts = email.split('@');
        if (parts.length === 2) {
          email = `${parts[0]}+${userId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)}@${parts[1]}`;
        } else {
          email = `${email}_${userId}`;
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
          notificationSettings: JSON.stringify({
            email_new_candidate: true,
            email_interview_complete: true,
            push_updates: false,
            marketing: false
          })
        }
      });
    }
    if (user && !user.notificationSettings) {
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          notificationSettings: JSON.stringify({
            email_new_candidate: true,
            email_interview_complete: true,
            push_updates: false,
            marketing: false
          })
        }
      });
    }
    return user;
  } catch (error) {
    console.error(`Failed to ensure user ${userId}:`, error);
    throw error;
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
    notificationSettings: String!
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
    updateProfile(fullName: String, companyName: String, role: String, website: String, notificationSettings: String): User!
    createJob(title: String!, description: String!, durationMinutes: Int, interviewType: [String!], experienceLevel: String): Job!
    updateJob(id: ID!, title: String, description: String, durationMinutes: Int, interviewType: [String!], status: String, experienceLevel: String): Job!
    deleteJob(id: ID!): Boolean!
    updateCandidateStatus(id: ID!, status: String!): Candidate!
    
    createCandidate(jobId: ID!, name: String!, email: String!): Candidate!
    updateCandidateInterviewStatus(id: ID!, status: String!, metaData: String): Candidate!
    getDeepgramToken: String!
    createTranscript(jobId: ID!, candidateId: ID!, userText: String!, aiText: String!): Boolean!
  }
`;

interface Context {
  userId: string;
}

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: Context) => {
      return prisma.user.findUnique({ where: { id: context.userId } });
    },
    jobs: async (_parent: any, _args: any, context: Context) => {
      return prisma.job.findMany({
        where: { userId: context.userId },
        orderBy: { createdAt: 'desc' }
      });
    },
    job: async (_parent: any, args: { id: string }) => {
      return prisma.job.findUnique({ where: { id: args.id } });
    },
    candidates: async (_parent: any, args: { jobId?: string }, context: Context) => {
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
      return prisma.activity.findMany({
        where: { userId: context.userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    },
    dashboardStats: async (_parent: any, _args: any, context: Context) => {
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
    },
    createdAt: (parent: any) => parent.createdAt?.toISOString(),
    updatedAt: (parent: any) => parent.updatedAt?.toISOString()
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
    },
    createdAt: (parent: any) => parent.createdAt?.toISOString(),
    updatedAt: (parent: any) => parent.updatedAt?.toISOString()
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

  User: {
    notificationSettings: (parent: any) => parent.notificationSettings || '{}',
    createdAt: (parent: any) => parent.createdAt?.toISOString(),
    updatedAt: (parent: any) => parent.updatedAt?.toISOString()
  },

  Mutation: {
    updateProfile: async (_parent: any, args: any, context: Context) => {
      return prisma.user.update({
        where: { id: context.userId },
        data: {
          fullName: args.fullName ?? undefined,
          companyName: args.companyName ?? undefined,
          role: args.role ?? undefined,
          website: args.website ?? undefined,
          notificationSettings: args.notificationSettings ?? undefined,
        }
      });
    },
    createJob: async (_parent: any, args: any, context: Context) => {
      const job = await prisma.job.create({
        data: {
          userId: context.userId,
          title: args.title,
          jobRole: args.title,
          description: args.description,
          durationMinutes: args.durationMinutes || 15,
          interviewType: args.interviewType || ["Technical"],
          status: 'ACTIVE',
          experienceLevel: args.experienceLevel || 'Mid-Level',
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
          experienceLevel: args.experienceLevel ?? undefined,
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

      const candidate = await prisma.candidate.create({
        data: {
          jobId: args.jobId,
          name: args.name,
          email: args.email,
          status: 'STARTED',
        }
      });

      // Send a background email alert to the recruiter
      setImmediate(async () => {
        try {
          const job = await prisma.job.findUnique({
            where: { id: args.jobId },
            include: { user: true }
          });
          if (job && job.user) {
            let settings = { email_new_candidate: true };
            if (job.user.notificationSettings) {
              try {
                settings = JSON.parse(job.user.notificationSettings);
              } catch (e) {}
            }
            if (settings.email_new_candidate !== false) {
              await sendEmail({
                to: job.user.email,
                subject: `New Candidate Registered: ${args.name} for ${job.title}`,
                htmlContent: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; line-height: 1.6; color: #333; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;">
                    <h2 style="color: #7c3aed; margin-top: 0;">New Candidate Registered</h2>
                    <p>Hello <strong>${job.user.fullName || 'Recruiter'}</strong>,</p>
                    <p>A new candidate has registered and started screening for the position: <strong>${job.title}</strong>.</p>
                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0;">
                      <p style="margin: 0 0 8px 0;"><strong>Candidate Information:</strong></p>
                      <ul style="margin: 0; padding-left: 20px; color: #475569;">
                        <li><strong>Name:</strong> ${args.name}</li>
                        <li><strong>Email:</strong> ${args.email}</li>
                        <li><strong>Registration Time:</strong> ${new Date().toLocaleString()}</li>
                      </ul>
                    </div>
                    <p>You will receive a detailed summary evaluation report as soon as they complete their interview session.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">This email was sent automatically by AIcruiter. You can manage alert preferences in settings.</p>
                  </div>
                `
              });
            }
          }
        } catch (err) {
          console.error("Failed to send registration email alert:", err);
        }
      });

      return candidate;
    },
    updateCandidateInterviewStatus: async (_parent: any, args: { id: string; status: string; metaData?: string }) => {
      const existingCandidate = await prisma.candidate.findUnique({
        where: { id: args.id }
      });
      const existingMeta = existingCandidate?.metaData && typeof existingCandidate.metaData === 'object' ? (existingCandidate.metaData as any) : {};
      const newMeta = args.metaData ? JSON.parse(args.metaData) : {};

      const candidate = await prisma.candidate.update({
        where: { id: args.id },
        data: {
          status: args.status,
          metaData: {
            ...existingMeta,
            ...newMeta
          },
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
    },
    createTranscript: async (_parent: any, args: { jobId: string; candidateId: string; userText: string; aiText: string }) => {
      await prisma.interviewTranscript.create({
        data: {
          jobId: args.jobId,
          candidateId: args.candidateId,
          userText: args.userText,
          aiText: args.aiText
        }
      });
      return true;
    }
  }
};

const startServer = async () => {
  const fastify = Fastify({ logger: true });

  // Security mitigation for GHSA-jx2c-rxcm-jvmq
  fastify.addHook('onRequest', async (request, reply) => {
    if (request.headers['content-type']?.includes('\t')) {
      reply.code(400).send({ error: 'Invalid Content-Type header' });
      return reply;
    }
  });

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
      let userId = DEFAULT_USER_ID;
      const authHeader = request.headers['authorization'];
      const xUserId = request.headers['x-user-id'];

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const verified = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
          });
          userId = verified.sub;
        } catch (error) {
          console.error("Clerk token verification failed:", error);
          if (typeof xUserId === 'string') {
            userId = xUserId;
          }
        }
      } else if (typeof xUserId === 'string') {
        userId = xUserId;
      }

      // Provision/sync user profile exactly once per request lifecycle
      await ensureUser(userId);

      return { userId };
    }
  });

  fastify.get('/health', async () => {
    return { status: 'OK' };
  });

  fastify.post('/api/speak', async (request, reply) => {
    const { text, persona } = request.body as { text: string; persona?: string };
    if (!text) {
      reply.status(400).send({ error: "Text parameter is required" });
      return;
    }

    const apiKey = process.env.NEXT_DEEPGRAM_API_KEY || process.env.VITE_DEEPGRAM_API_KEY;
    if (!apiKey) {
      reply.status(500).send({ error: "Deepgram API key not configured on backend" });
      return;
    }

    // Map selected persona to the appropriate Deepgram Aura voice model
    let voiceModel = 'aura-asteria-en'; // Default: Sarah (female)
    if (persona === 'David') {
      voiceModel = 'aura-orion-en';     // David: Male voice
    } else if (persona === 'Emma') {
      voiceModel = 'aura-stella-en';    // Emma: Female voice (Stella)
    } else if (persona === 'Sarah') {
      voiceModel = 'aura-asteria-en';   // Sarah: Female voice (Asteria)
    }

    try {
      const response = await fetch(`https://api.deepgram.com/v1/speak?model=${voiceModel}`, {
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

