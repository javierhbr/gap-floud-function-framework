import { BaseMiddleware } from '../handler';
import { Context } from '../core';
import { AuthenticationError, HttpError } from '../errors';

export interface CustomTokenVerificationPort<T> {
  verifyToken(token: string): Promise<T>;
}

export class AuthenticationMiddleware<T> implements BaseMiddleware {
  constructor(private tokenVerificationPort: CustomTokenVerificationPort<T>) {}

  async before(context: Context): Promise<void> {
    const authHeader = context.req.headers?.authorization;

    if (!authHeader) {
      throw new HttpError(401, 'No authorization header');
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      if (!token) {
        throw new AuthenticationError('Invalid token format');
      }

      context.user = await this.tokenVerificationPort.verifyToken(token);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new AuthenticationError('Invalid authentication');
    }
  }
}

export const verifyAuthTokenMiddleware = <T>(
  tokenVerificationPort: CustomTokenVerificationPort<T>
): BaseMiddleware => ({
  async before(context: Context): Promise<void> {
    const authHeader = context.req.headers?.authorization;

    if (!authHeader) {
      throw new HttpError(401, 'No authorization header');
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      if (!token) {
        throw new AuthenticationError('Invalid token format');
      }

      context.user = await tokenVerificationPort.verifyToken(token);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new AuthenticationError('Invalid authentication');
    }
  },
});
