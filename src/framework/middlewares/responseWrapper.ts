import { Request, Response } from '@google-cloud/functions-framework';

type NextFunction = () => Promise<void>;

interface ResponseBody {
  data: unknown;
  success: boolean;
  timestamp: string;
}

export const responseWrapper = (): ((
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);
    res.json = (body: unknown): Response => {
      return originalJson({
        data: body,
        success: res.statusCode >= 200 && res.statusCode < 300,
        timestamp: new Date().toISOString(),
      } as ResponseBody);
    };
    await next();
  };
};
