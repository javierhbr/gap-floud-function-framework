import { z } from 'zod';

export const weatherSchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  date: z.string().datetime(),
  location: z.string(),
});

export const weatherUpdateSchema = z.object({
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  date: z.string().datetime().optional(),
  location: z.string().optional(),
});
