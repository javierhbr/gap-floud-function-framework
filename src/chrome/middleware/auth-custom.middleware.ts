import 'reflect-metadata';
import { Context, BaseMiddleware, AuthenticationError } from '@noony/core';
import { Container } from 'typedi';
import { JwtUtil } from '../utils/jwtUtil';

export const basicAuthMiddleware: BaseMiddleware = {
  before: async (context: Context) => {
    const authHeader = context.req.headers.authorization;
    if (!authHeader?.startsWith('Basic ')) {
      throw new Error('Missing or invalid basic auth');
    }
    // Implement basic auth verification logic here
  },
};


interface UserPayload {
  email: string;
  // Add other user properties as needed
}


export const bearerAuthMiddleware: BaseMiddleware = {
  before: async (context: Context) => {
    const authHeader = context.req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid bearer token');
    }

    const token = authHeader.split(' ')[1];
    const jwtUtil = Container.get(JwtUtil);

    try {
      const decodedToken = await jwtUtil.verifyToken<UserPayload>(token);

      // Set the user information in the context
      context.user = {
        email: decodedToken.email,
        // Map other user properties as needed
      };
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  },
};
