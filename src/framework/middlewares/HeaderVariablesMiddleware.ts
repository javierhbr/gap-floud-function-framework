import { BaseMiddleware } from './base/Middleware';
import { Context } from '@framework/types/Context';

export class HeaderVariablesMiddleware implements BaseMiddleware {
  constructor(private requiredHeaders: string[]) {}

  async before(context: Context): Promise<void> {
    context.req.headers = context.req.headers || {};

    for (const header of this.requiredHeaders) {
      if (!context.req.headers[header.toLowerCase()]) {
        throw new Error(`Missing required header: ${header}`);
      }
    }
  }
}
