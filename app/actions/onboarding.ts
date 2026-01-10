
'use server';

import { z } from 'zod';
// In a real app, you would import the prisma client
// import { prisma } from '../../lib/prisma';

export const onboardingSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  role: z.string().min(1, "Role is required"),
  companyName: z.string().min(2, "Company name is required"),
  website: z.string().optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

// Mock implementation for the frontend demo environment
// In production, this would query the database directly
export async function checkOnboardingStatus(email: string) {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check local storage for demo persistence
  if (typeof window !== 'undefined') {
    const isOnboarded = localStorage.getItem(`aicruiter_onboarded_${email}`);
    return isOnboarded === 'true';
  }
  
  return false;
}

export async function submitOnboarding(email: string, data: OnboardingData) {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log("Submitting onboarding for:", email, data);
  
  // Persist to local storage for demo
  if (typeof window !== 'undefined') {
    localStorage.setItem(`aicruiter_onboarded_${email}`, 'true');
    localStorage.setItem(`aicruiter_user_${email}`, JSON.stringify(data));
  }
  
  // In production:
  // await prisma.user.update({
  //   where: { email },
  //   data: {
  //     fullName: data.fullName,
  //     role: data.role,
  //     companyName: data.companyName,
  //     website: data.website,
  //     onboarded: true
  //   }
  // });

  return { success: true };
}
