import { HttpError } from '@core/errors';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

export const verifyToken = async (token: string): Promise<TokenPayload> => {
  try {
    // Replace this with your actual JWT secret from environment variables
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    const decoded = jwt.verify(token, secret) as TokenPayload;

    if (!decoded.userId || !decoded.email) {
      throw new HttpError(401, 'Invalid token payload');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(401, 'Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, 'Token expired');
    }
    throw error;
  }
};
