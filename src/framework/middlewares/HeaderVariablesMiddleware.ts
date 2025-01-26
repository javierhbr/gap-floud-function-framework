import { Context } from './base/Middleware';
import { BaseMiddleware } from '../../core/handler';

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
