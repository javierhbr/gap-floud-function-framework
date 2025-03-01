import { z } from 'zod';
import { Error } from '../../domain/genericDomain';
import { ErrorSchema } from './generic.dto';

// LoginRequest schema
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  channel: z.string(),
});

// LoginResponse schema
export const LoginResponseSchema = z.object({
  user: z.string().optional(),
  token: z.string().optional(),
  error: ErrorSchema.optional(),
});

// SentOtpRequest schema
export const SentOtpRequestSchema = z.object({
  email: z.string().email(),
});

// VerifyOtpRequest schema
export const VerifyOtpRequestSchema = z.object({
  email: z.string(),
  verification: z.string(),
  error: ErrorSchema.optional(),
});

// VerifyOtpResponse schema
export const VerifyOtpResponseSchema = z.object({
  user: z.string().optional(),
  token: z.string().optional(),
});

export interface LoginRequest {
  email: string;
  password: string;
  channel: string;
}

export interface LoginResponse {
  user?: string;
  token?: string;
  error?: Error;
}

export interface SentOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  verification: string;
  error?: Error;
}

export interface VerifyOtpResponse {
  email?: string;
  token?: string;
}

export type LoginRequestType = z.infer<typeof LoginRequestSchema>;
export type LoginResponseType = z.infer<typeof LoginResponseSchema>;
export type SentOtpRequestType = z.infer<typeof SentOtpRequestSchema>;
export type VerifyOtpRequestType = z.infer<typeof VerifyOtpRequestSchema>;
export type VerifyOtpResponseType = z.infer<typeof VerifyOtpResponseSchema>;
