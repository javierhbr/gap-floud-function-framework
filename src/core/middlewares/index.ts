import { z, ZodSchema } from 'zod';
import { Container } from 'typedi';
import { AuthenticationError, HttpError, ValidationError } from '../errors';
import { BaseMiddleware } from '../handler';
import { Context } from '../core';
import { logger } from '../logger';

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

export const bodyValidator = (schema: z.ZodSchema): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    try {
      await schema.parseAsync(context.req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Validation error', JSON.stringify(error.errors));
      }
      throw error;
    }
  },
});

export const dependencyInjection = (): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    context.container = Container.of();
  },
});

export const authentication = (
  verifyToken: (token: string) => Promise<unknown>
): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    const authHeader = context.req.headers?.authorization;

    if (!authHeader) {
      throw new HttpError(401, 'No authorization header');
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      context.user = await verifyToken(token);
    } catch (error) {
      throw new AuthenticationError('Invalid authentication');
    }
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

export const errorHandler = (): BaseMiddleware => ({
  onError: async (error: Error, context: Context): Promise<void> => {
    logger.error('Error processing request', {
      errorMessage: error?.message,
      errorStack: error?.stack,
    });

    if (error instanceof HttpError) {
      context.res.status(error.status).json({
        error: error.message,
        details: error.details,
      });
    } else {
      context.res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  },
});

export const responseWrapperV2 = <T>() => ({
  after: async (context: Context) => {
    if (!context.res.headersSent) {
      const statusCode = context.res.statusCode || 200;
      const body = context.res.locals.responseBody as T;
      context.res.status(statusCode).json({
        success: true,
        data: body,
        timestamp: new Date().toISOString(),
      });
    }
  },
});
