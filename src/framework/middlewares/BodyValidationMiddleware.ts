import { BaseMiddleware } from '../../core/handler';
import { Context } from './base/Middleware';
import { z } from 'zod';
import { HttpError } from '../../core/errors';

export class BodyValidationMiddleware implements BaseMiddleware {
  constructor(private readonly schema: z.ZodSchema) {}

  async before(context: Context): Promise<void> {
    try {
      context.req.validatedBody = await this.schema.parseAsync(context.req.parsedBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HttpError(400, 'Validation error', JSON.stringify(error.errors));
      }
      throw error;
    }
  }
}
