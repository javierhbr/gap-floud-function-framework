import 'reflect-metadata';
import { Context, BaseMiddleware, AuthenticationError } from '@noony/core';
import { Container } from 'typedi';
import { JwtUtil } from '../utils/jwtUtil';
import { UserTokenPayload } from '../domain/user';
import { convertToUserFromTokenPayload } from '../mappers/userMapper';
import { config } from '../../config/environment';

export const basicAuthMiddleware: BaseMiddleware = {
  before: async (context: Context) => {
    const authHeader = context.req.headers.authorization;
    if (!authHeader?.startsWith('Basic ')) {
      throw new Error('Missing or invalid basic auth');
    }
    // Implement basic auth verification logic here
  },
};

export enum API_KEYS_TYPE {
  GUEST = 'GUEST',
  LOGIN = 'LOGIN',
}

export const apiKeyMiddleware = (keyType: API_KEYS_TYPE): BaseMiddleware => ({
  before: async (context: Context) => {
    const apiKey = context.req.headers['x-api-key'];

    if (!apiKey) {
      throw new AuthenticationError('API key is required');
    }

    if (apiKey !== config.apiKeys[keyType]) {
      throw new AuthenticationError('Invalid API key');
    }
  },
});

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
