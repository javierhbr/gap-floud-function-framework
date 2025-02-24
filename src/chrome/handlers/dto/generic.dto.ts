import { z } from 'zod';

// Error schema
export const ErrorSchema = z.object({
  status: z.number().optional(),
  code: z.string().optional(),
  message: z.string().optional(),
  details: z.record(z.any()).optional(),
});

// ChatRequestApi schema
export const ChatRequestApiSchema = z.object({
  contextId: z.string(),
  message: z.string(),
});

// ChatResponseApi schema
export const LinkSchema = z.object({
  title: z.string().optional(),
  url: z.string().url().optional(),
});

export const WarningSchema = z.object({
  type: z.string().optional(),
  message: z.string().optional(),
});

export const ChatResponseApiSchema = z.object({
  contextId: z.string().optional(),
  dateTime: z.string().datetime().optional(),
  replyMessage: z.string().optional(),
  links: z.array(LinkSchema).optional(),
  warning: WarningSchema.optional(),
  error: ErrorSchema.optional(),
});

// BaseResponse schema
export const BaseResponseSchema = z.object({
  error: ErrorSchema.optional(),
});

// Type inference helpers
export type ChatRequestType = z.infer<typeof ChatRequestApiSchema>;
export type ChatResponseType = z.infer<typeof ChatResponseApiSchema>;
export type BaseResponseType = z.infer<typeof BaseResponseSchema>;
