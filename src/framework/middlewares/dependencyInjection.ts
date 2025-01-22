import { Request, Response } from '@google-cloud/functions-framework';

type Middleware = (req: Request, res: Response, next: () => Promise<void>) => Promise<void>;

export const dependencyInjection = (): Middleware => {
  return async (req: Request, _res: Response, next: () => Promise<void>) => {
    // Add your dependency injection logic here
    // For example: req.container = container;
    await next();
  };
};
