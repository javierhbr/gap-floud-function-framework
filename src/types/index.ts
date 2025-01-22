import { Request, Response } from '@google-cloud/functions-framework';
import { Container } from 'typedi';

export type NextFunction = () => Promise<void>;

export type MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export type HandlerFunction = (req: Request, res: Response) => Promise<void>;

export interface Context {
  container: Container;
  request: Request;
  response: Response;
}

export interface ErrorResponse {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}
