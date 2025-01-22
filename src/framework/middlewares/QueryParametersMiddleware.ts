import { BaseMiddleware } from './base/Middleware';
import { Request, Response, NextFunction } from '@google-cloud/functions-framework';

export class QueryParametersMiddleware extends BaseMiddleware {
  constructor(private readonly requiredParams: string[] = []) {
    super();
  }

  async before(req: Request, res: Response, next: NextFunction): Promise<void> {
    const url = new URL(req.url, `http://${req.headers.host}`);
    req.query = Object.fromEntries(url.searchParams);

    for (const param of this.requiredParams) {
      if (!req.query[param]) {
        throw new Error(`Missing required query parameter: ${param}`);
      }
    }

    await next();
  }
}
