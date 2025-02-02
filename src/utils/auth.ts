import jwt from 'jsonwebtoken';
import { CustomTokenVerificationPort } from '@noony/core';

interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

export const jwtTokenVerificationPort: CustomTokenVerificationPort<TokenPayload> =
  {
    async verifyToken(token: string): Promise<TokenPayload> {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret) as TokenPayload;
      return decoded;
    },
  };
