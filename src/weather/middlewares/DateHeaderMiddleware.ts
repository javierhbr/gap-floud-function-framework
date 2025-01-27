import { BaseMiddleware } from '../../core/handler';
import { Context } from '../../core/core';

export class DateHeaderMiddleware implements BaseMiddleware {
  async before(context: Context): Promise<void> {
    context.res.setHeader('x-date', new Date().toISOString());
  }
}
