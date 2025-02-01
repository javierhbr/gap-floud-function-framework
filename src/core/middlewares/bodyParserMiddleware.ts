import { BaseMiddleware } from '../handler';
import { Context } from '../core';
import { ValidationError } from '../errors';

export class BodyParserMiddleware implements BaseMiddleware {
  async before(context: Context): Promise<void> {
    if (context.req.body && typeof context.req.body === 'string') {
      try {
        context.req.parsedBody = JSON.parse(context.req.body);
      } catch (error) {
        throw new ValidationError('Invalid JSON body');
      }
    }

    // Handle Pub/Sub messages
    if (context.req.body?.message?.data) {
      try {
        const decoded = Buffer.from(
          context.req.body.message.data,
          'base64'
        ).toString();
        context.req.parsedBody = JSON.parse(decoded);
      } catch (error) {
        throw new ValidationError('Invalid Pub/Sub message');
      }
    }
  }
}

export const bodyParser = (): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    const { method, body } = context.req;

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (typeof body === 'string') {
        context.req.parsedBody = JSON.parse(body);
      } else if (body?.message?.data) {
        const decoded = Buffer.from(body.message.data, 'base64').toString();
        context.req.body = JSON.parse(decoded);
      } else {
        context.req.parsedBody = body;
      }
    }
  },
});
