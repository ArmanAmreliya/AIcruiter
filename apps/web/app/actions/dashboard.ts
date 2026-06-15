
'use server';

import { z } from 'zod';
import { prisma } from '../../lib/prisma';

// Define the schema for the return object
const DashboardStatsSchema = z.object({
  totalCandidates: z.number(),
  activeJobs: z.number(),
  aiCredits: z.number(),
  timeSavedHours: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export async function getDashboardStats(userEmail: string): Promise<DashboardStats> {
  if (!userEmail) {
    throw new Error("User email is required to fetch stats.");
  }

  // 1. Get User Details
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, aiCredits: true }
  });

  if (!user) {
    // If user doesn't exist in Prisma DB yet, return zeroed stats
    return {
      totalCandidates: 0,
      activeJobs: 0,
      aiCredits: 0,
      timeSavedHours: 0,
    };
  }

  // 2. Get Active Jobs Count
  const activeJobsCount = await prisma.job.count({
    where: {
      userId: user.id,
      status: 'ACTIVE'
    }
  });

  // 3. Get Total Candidates Count (across all jobs belonging to the user)
  const totalCandidatesCount = await prisma.candidate.count({
    where: {
      job: {
        userId: user.id
      }
    }
  });

  // 4. Calculate Time Saved
  // Logic: 30 minutes (0.5 hours) saved per candidate processed
  const timeSavedHours = Math.round(totalCandidatesCount * 0.5);

  const stats = {
    totalCandidates: totalCandidatesCount,
    activeJobs: activeJobsCount,
    aiCredits: user.aiCredits,
    timeSavedHours: timeSavedHours,
  };

  // Validate and return
  return DashboardStatsSchema.parse(stats);
}
