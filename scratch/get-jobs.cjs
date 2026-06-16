const { prisma } = require('../packages/db/dist'); // Let's check where it is located or write a direct prisma query

async function getJobs() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const jobs = await prisma.job.findMany({
      include: {
        user: true
      }
    });
    console.log('Jobs:', JSON.stringify(jobs, null, 2));
  } catch (err) {
    console.error('Error fetching jobs:', err);
  } finally {
    await prisma.$disconnect();
  }
}

getJobs();
