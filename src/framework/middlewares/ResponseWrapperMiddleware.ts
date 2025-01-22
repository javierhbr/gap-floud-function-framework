import { BaseMiddleware } from '@core/handler';
import { Context } from '@framework/middlewares/base/Middleware';
import { Response } from '@google-cloud/functions-framework';

export class ResponseWrapperMiddleware implements BaseMiddleware {
  async before(context: Context): Promise<void> {
    const originalJson = context.res.json.bind(context.res);

    context.res.json = (body: unknown): Response => {
      return originalJson({
        success: context.res.statusCode >= 200 && context.res.statusCode < 300,
        statusCode: context.res.statusCode,
        data: body,
        timestamp: new Date().toISOString(),
      });
    };
  }

  async after(context: Context): Promise<void> {
    if (!context.res.headersSent) {
      context.res.json({ message: 'Request completed successfully' });
    }
  }
}
