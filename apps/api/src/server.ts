import Fastify, { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { ApolloServer } from '@apollo/server';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import dotenv from 'dotenv';
import { prisma } from '@aicruiter/db';

dotenv.config({ path: '../../.env' }); // Load .env from monorepo root

// Default fallback user ID for demo/dev purposes
const DEFAULT_USER_ID = 'demo-recruiter-id-123';

async function ensureUser(userId: string) {
  try {
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: 'recruiter@example.com',
          fullName: 'Demo Recruiter',
          companyName: 'AIcruiter Inc.',
          role: 'Lead Recruiter',
          aiCredits: 100,
          onboarded: true,
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
      return prisma.candidate.update({
        where: { id: args.id },
        data: {
          status: args.status,
          metaData: args.metaData ? JSON.parse(args.metaData) : undefined,
        }
      });
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

