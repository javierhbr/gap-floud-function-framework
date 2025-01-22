import { BaseMiddleware } from '@core/handler';
import { Context } from '@framework/middlewares/base/Middleware';
import { HttpError } from '@core/errors';
import { verifyToken } from '@utils/auth';

export class AuthenticationMiddleware implements BaseMiddleware {
  async before(context: Context): Promise<void> {
    const authHeader = context.req.headers?.authorization;

    if (!authHeader) {
      throw new HttpError(401, 'No authorization header');
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      if (!token) {
        throw new HttpError(401, 'Invalid token format');
      }

      context.user = await verifyToken(token);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(401, 'Invalid authentication');
    }
  }
}
