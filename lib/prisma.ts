// In this environment, we don't have a running database or generated Prisma Client.
// We provide a mock implementation to satisfy build requirements.

export const prisma = {
  user: {
    findUnique: async () => null,
  },
  job: {
    count: async () => 0,
  },
  candidate: {
    count: async () => 0,
  }
} as any;