import { Context } from '../core';
import { BaseMiddleware } from '../handler';
import { ValidationError } from '../errors';
import { z, ZodSchema } from 'zod';

export class PathParametersMiddleware implements BaseMiddleware {
  async before(context: Context): Promise<void> {
    const url = new URL(context.req.url, `http://${context.req.headers.host}`);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    context.req.params = context.req.params || {};

    // Extract path parameters based on your routing configuration
    // This is a simplified example
    pathSegments.forEach((segment, index) => {
      if (segment.startsWith(':')) {
        const paramName = segment.slice(1);
        context.req.params[paramName] = pathSegments[index];
      }
    });
  }
}

export const pathParameters = (): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    const url = new URL(context.req.url, `http://${context.req.headers.host}`);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    context.req.params = {};

    pathSegments.forEach((segment, index) => {
      if (segment.startsWith(':')) {
        const paramName = segment.slice(1);
        context.req.params[paramName] = pathSegments[index];
      }
    });
  },
});

export const headerVariablesValidator = (requiredHeaders: string[]): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    for (const header of requiredHeaders) {
      if (!context.req.headers?.[header.toLowerCase()]) {
        throw new ValidationError(`Missing required header: ${header}`);
      }
    }
  },
});

export const validatedQueryParameters = (schema: ZodSchema): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    const queryParams = context.req.query;

    try {
      schema.parse(queryParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Validation error', JSON.stringify(error.errors));
      }
      throw error;
    }
  },
});
