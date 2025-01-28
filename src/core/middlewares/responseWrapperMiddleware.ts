import { BaseMiddleware } from '../handler';
import { Context } from '../core';

export class ResponseWrapperMiddleware<T> implements BaseMiddleware {
  async after(context: Context): Promise<void> {
    if (!context.res.headersSent) {
      const statusCode = context.res.statusCode || 200;
      const body = context.res.locals.responseBody as T;
      context.res.status(statusCode).json({
        success: true,
        data: body,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const responseWrapperV2 = <T>() => ({
  after: async (context: Context): Promise<void> => {
    if (!context.res.headersSent) {
      const statusCode = context.res.statusCode || 200;
      const body = context.res.locals.responseBody as T;
      context.res.status(statusCode).json({
        success: true,
        data: body,
        timestamp: new Date().toISOString(),
      });
    }
  },
});
