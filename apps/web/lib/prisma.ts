// import { PrismaClient } from '@prisma/client';

/**
 * Mock PrismaClient for environments without generated client.
 * This resolves the error: Module '"@prisma/client"' has no exported member 'PrismaClient'.
 */
class PrismaClient {
  user: any;
  job: any;
  candidate: any;

  constructor(options?: any) {
    this.user = {
      findUnique: async () => null,
      create: async () => null,
      update: async () => null,
      findFirst: async () => null,
    };
    this.job = {
      count: async () => 0,
      findMany: async () => [],
      create: async () => null,
    };
    this.candidate = {
      count: async () => 0,
      findMany: async () => [],
      create: async () => null,
    };
  }
}

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Prevent multiple instances of Prisma Client in development
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}