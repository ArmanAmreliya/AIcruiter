'use server';

import { type OnboardingData } from '@aicruiter/types';
import { prisma } from '@aicruiter/db';

export async function checkOnboardingStatus(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { onboarded: true }
    });
    return user?.onboarded || false;
  } catch (error) {
    console.error("Failed to check onboarding status from DB:", error);
    return false;
  }
}

export async function submitOnboarding(email: string, data: OnboardingData) {
  try {
    console.log("Submitting onboarding for:", email, data);

    // 1. Check if the user is in auth.users by email to get their ID
    const authUsers: any[] = await (prisma as any).$queryRawUnsafe(
      `SELECT id FROM auth.users WHERE email = $1 LIMIT 1`,
      email
    ).catch(() => []);
    
    if (authUsers && authUsers.length > 0) {
      const userId = authUsers[0].id;
      // 2. Upsert the user profile in our public User table
      await prisma.user.upsert({
        where: { id: userId },
        update: {
          email,
          fullName: data.fullName,
          companyName: data.companyName,
          role: data.role,
          website: data.website || null,
          onboarded: true
        },
        create: {
          id: userId,
          email,
          fullName: data.fullName,
          companyName: data.companyName,
          role: data.role,
          website: data.website || null,
          aiCredits: 100,
          onboarded: true
        }
      });
    } else {
      // Fallback: update by email if they already exist in the User table
      await prisma.user.updateMany({
        where: { email },
        data: {
          fullName: data.fullName,
          companyName: data.companyName,
          role: data.role,
          website: data.website || null,
          onboarded: true
        }
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to submit onboarding:", error);
    throw error;
  }
}
