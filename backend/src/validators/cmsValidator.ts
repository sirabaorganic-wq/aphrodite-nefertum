import { z } from 'zod';

export const createCmsSchema = z.object({
  type: z.enum(['JOURNAL', 'PHILOSOPHY', 'BOTANICS', 'CAREGUIDE', 'POLICY_PRIVACY', 'POLICY_TERMS', 'POLICY_RETURNS']),
  title: z.string({ required_error: 'Title is required' }).min(1),
  slug: z.string().optional(),
  content: z.string({ required_error: 'Content body is required' }).min(1),
  excerpt: z.string().optional(),
  mediaUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateCmsSchema = createCmsSchema.partial();
