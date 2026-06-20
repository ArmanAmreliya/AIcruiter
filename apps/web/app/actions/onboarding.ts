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

    // Update by email in the User table since user record was already created on the API first-contact
    await prisma.user.update({
      where: { email },
      data: {
        fullName: data.fullName,
        companyName: data.companyName,
        role: data.role,
        website: data.website || null,
        onboarded: true
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to submit onboarding:", error);
    throw error;
  }
}
