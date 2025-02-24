import 'reflect-metadata';
import { Context, BaseMiddleware } from '@noony/core';

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
      throw new Error('Missing or invalid bearer token');
    }
    // Implement JWT verification logic here
  },
};
