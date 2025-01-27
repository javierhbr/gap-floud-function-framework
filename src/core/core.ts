import { Request, Response } from '@google-cloud/functions-framework';
import Container from 'typedi';

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

export interface CustomRequest extends Request {
  parsedBody?: unknown;
  validatedBody?: unknown;
  user?: TokenPayload;
}

export interface CustomResponse extends Response {}

export interface Context {
  req: CustomRequest;
  res: CustomResponse;
  container?: Container;
  error?: Error | null;
  businessData: Map<string, unknown>;
  user?: unknown;
}
