import { Request, Response } from '@google-cloud/functions-framework';

type Middleware = (req: Request, res: Response, next: () => Promise<void>) => Promise<void>;

export const errorHandler = (): Middleware => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };
};
