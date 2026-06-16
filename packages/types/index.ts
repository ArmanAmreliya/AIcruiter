import { z } from 'zod';

export const onboardingSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  role: z.string().min(1, "Role is required"),
  companyName: z.string().min(2, "Company name is required"),
  website: z.string().optional().or(z.literal('')),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

export const jobCreationSchema = z.object({
  title: z.string().min(2, "Job title is required"),
  jobRole: z.string().min(2, "Job role description is required"),
  durationMinutes: z.number().int().min(5).max(60).default(15),
  interviewType: z.array(z.string()).min(1, "At least one interview type is required"),
  experienceLevel: z.string().min(1, "Experience level is required"),
});

export type JobCreationData = z.infer<typeof jobCreationSchema>;

export const candidateRegistrationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export type CandidateRegistrationData = z.infer<typeof candidateRegistrationSchema>;
