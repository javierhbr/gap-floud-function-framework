import { BaseMiddleware } from '../handler';
import { Context } from '../core';
import { z } from 'zod';
import { ValidationError } from '../errors';

export class BodyValidationMiddleware implements BaseMiddleware {
  constructor(private readonly schema: z.ZodSchema) {}

  async before(context: Context): Promise<void> {
    try {
      context.req.validatedBody = await this.schema.parseAsync(context.req.parsedBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Validation error', JSON.stringify(error.errors));
      }
      throw error;
    }
  }
}

export const bodyValidator = (schema: z.ZodSchema): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    try {
      await schema.parseAsync(context.req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Validation error', JSON.stringify(error.errors));
      }
      throw error;
    }
  },
});
