import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  contentType: z.enum(['blog', 'article', 'report', 'summary']),
  tonePreference: z.enum(['formal', 'casual', 'technical', 'persuasive']),
  targetLength: z.number().int().min(100).max(10000),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
