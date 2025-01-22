import { BaseMiddleware } from '@core/handler';
import { Context } from '@framework/middlewares/base/Middleware';
import { HttpError } from '@core/errors';

export class BodyParserMiddleware implements BaseMiddleware {
  async before(context: Context): Promise<void> {
    if (context.req.body && typeof context.req.body === 'string') {
      try {
        context.req.parsedBody = JSON.parse(context.req.body);
      } catch (error) {
        throw new HttpError(400, 'Invalid JSON body');
      }
    }

    // Handle Pub/Sub messages
    if (context.req.body?.message?.data) {
      try {
        const decoded = Buffer.from(context.req.body.message.data, 'base64').toString();
        context.req.parsedBody = JSON.parse(decoded);
      } catch (error) {
        throw new HttpError(400, 'Invalid Pub/Sub message');
      }
    }
  }
}
