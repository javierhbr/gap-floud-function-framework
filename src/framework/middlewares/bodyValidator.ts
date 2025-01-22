import { Request, Response } from '@google-cloud/functions-framework';
import { ZodSchema } from 'zod';

type Middleware = (req: Request, res: Response, next: () => Promise<void>) => Promise<void>;

export const bodyValidator = (schema: ZodSchema): Middleware => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation error',
        details: result.error.errors,
      });
      return;
    }
    req.body = result.data;
    await next();
  };
};
