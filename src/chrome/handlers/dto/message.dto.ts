import { z } from 'zod';
import { ErrorSchema, LinkSchema, WarningSchema } from './generic.dto';
import { Error, Link, Warning } from '../../domain/genericDomain';

// ChatRequestApi schema
export const ChatRequestApiSchema = z.object({
  contextId: z.string(),
  message: z.string(),
});
export const ChatResponseApiSchema = z.object({
  contextId: z.string().optional(),
  dateTime: z.string().datetime({ offset: true }).optional(),
  replyMessage: z.string().optional(),
  links: z.array(LinkSchema).optional(),
  warning: WarningSchema.optional(),
  error: ErrorSchema.optional(),
});

export interface ChatResponseApi {
  contextId: string;
  dateTime: Date;
  replyMessage: string;
  links?: Link[];
  warning?: Warning;
  error?: Error;
}

// Type inference helpers
export type ChatRequestType = z.infer<typeof ChatRequestApiSchema>;
export type ChatResponseType = z.infer<typeof ChatResponseApiSchema>;
