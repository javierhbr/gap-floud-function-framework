import { BaseMiddleware } from './base/Middleware';
import { Request, Response, NextFunction } from '@google-cloud/functions-framework';
import { z } from 'zod';
import { HttpError } from '../errors/HttpError';

export class BodyValidationMiddleware extends BaseMiddleware {
  constructor(private readonly schema: z.ZodSchema) {
    super();
  }

  async before(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      req.validatedBody = await this.schema.parseAsync(req.body);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HttpError(400, 'Validation error', error.errors);
      }
      throw error;
    }
  }
}
