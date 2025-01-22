import { z } from 'zod';
import { Container } from 'typedi';
import { logger } from '@utils/logger';
import { HttpError } from '@core/errors';
import { Context } from '@framework/middlewares/base/Middleware';
import { BaseMiddleware } from '@core/handler';

export const bodyParser = (): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    if (context.req.method === 'POST' || context.req.method === 'PUT') {
      if (typeof context.req.body === 'string') {
        try {
          context.req.parsedBody = JSON.parse(context.req.body);
        } catch (error) {
          throw new HttpError(400, 'Invalid JSON body');
        }
      } else if (context.req.body?.message?.data) {
        try {
          const decoded = Buffer.from(context.req.body.message.data, 'base64').toString();
          context.req.body = JSON.parse(decoded);
        } catch (error) {
          throw new HttpError(400, 'Invalid Pub/Sub message');
        }
      } else {
        context.req.parsedBody = context.req.body;
      }
    }
  },
});

export const bodyValidator = (schema: z.ZodSchema): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    try {
      context.req.validatedBody = await schema.parseAsync(context.req.parsedBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HttpError(400, 'Validation error', JSON.stringify(error.errors));
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
      context.req.user = await verifyToken(token);
    } catch (error) {
      throw new HttpError(401, 'Invalid authentication');
    }
  },
});

export const headerVariables = (requiredHeaders: string[]): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    for (const header of requiredHeaders) {
      if (!context.req.headers?.[header.toLowerCase()]) {
        throw new HttpError(400, `Missing required header: ${header}`);
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

export const queryParameters = (requiredParams: string[] = []): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    const url = new URL(context.req.url, `http://${context.req.headers.host}`);
    context.req.query = Object.fromEntries(url.searchParams);

    for (const param of requiredParams) {
      if (!context.req.query[param]) {
        throw new HttpError(400, `Missing required query parameter: ${param}`);
      }
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

export const responseWrapper = (): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    const originalJson = context.res.json.bind(context.res);

    context.res.json = (body: unknown) => {
      return originalJson({
        success: context.res.statusCode >= 200 && context.res.statusCode < 300,
        statusCode: context.res.statusCode,
        data: body,
        timestamp: new Date().toISOString(),
      });
    };
  },

  after: async (context: Context): Promise<void> => {
    if (!context.res.headersSent) {
      context.res.json({ message: 'Request completed successfully' });
    }
  },
});
