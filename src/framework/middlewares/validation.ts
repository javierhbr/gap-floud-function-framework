import { z } from 'zod';
import { MiddlewareFunction } from '../../types';
import { ValidationError } from '../../core/errors';

export const validateBody = (schema: z.ZodType): MiddlewareFunction => {
  return async (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid request body', error.errors);
      }
      throw error;
    }
  };
};
