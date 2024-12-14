import { z } from 'zod';

export const artistSearchSchema = z.object({
  query: z.object({
    q: z.string().min(1).max(100)
  })
});

export const artistIdSchema = z.object({
  params: z.object({
    id: z.string().length(22)
  })
});