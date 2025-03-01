import 'reflect-metadata';
import { Context, BaseMiddleware, AuthenticationError } from '@noony/core';
import { Container } from 'typedi';
import { JwtUtil } from '../utils/jwtUtil';
import { UserTokenPayload } from '../domain/user';
import { convertToUserFromTokenPayload } from '../mappers/userMapper';

export const basicAuthMiddleware: BaseMiddleware = {
  before: async (context: Context) => {
    const authHeader = context.req.headers.authorization;
    if (!authHeader?.startsWith('Basic ')) {
      throw new Error('Missing or invalid basic auth');
    }
    // Implement basic auth verification logic here
  },
};

export const bearerAuthMiddleware: BaseMiddleware = {
  before: async (context: Context) => {
    const authHeader = context.req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid bearer token');
    }

    const token = authHeader.split(' ')[1];
    const jwtUtil = Container.get(JwtUtil);

    try {
      const decodedToken = await jwtUtil.verifyToken<UserTokenPayload>(token);

      // Set the user information in the context
      context.user = convertToUserFromTokenPayload(decodedToken);
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  },
};
