import { z } from 'zod';

export const chatRequestSchema = z.object({
  contextId: z.string(),
  message: z.string(),
});
