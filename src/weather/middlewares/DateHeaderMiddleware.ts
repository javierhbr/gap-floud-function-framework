import { BaseMiddleware } from '../../core/handler';
import { Context } from '../../framework/middlewares/base/Middleware';

export class DateHeaderMiddleware extends BaseMiddleware {
  async before(context: Context): Promise<void> {
    context.res.setHeader('x-date', new Date().toISOString());
  }
}
