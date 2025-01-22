import { http, Request, Response } from '@google-cloud/functions-framework';

import { z } from 'zod';
import { logger } from './utils/logger';
import { Handler } from './framework/Handler';
import { bodyValidator, dependencyInjection, responseWrapper } from './framework/middlewares';
import { errorHandler } from './middleware/error-handler';

// Request schema validation
const helloWorldSchema = z.object({
  name: z.string().optional(),
});

// Hello World endpoint
export const helloWorld = http(
  'helloWorld',
  Handler.use(dependencyInjection())
    .use(bodyValidator(helloWorldSchema))
    .use(errorHandler())
    .use(responseWrapper())
    .handle(async (request: Request, response: Response) => {
      logger.info('Hello logs!', { structuredData: true });

      const name = request.body?.name || 'World';
      response.json({
        message: `Hello, ${name}!`,
        timestamp: new Date().toISOString(),
      });
    })
);

// Health check endpoint
export const healthCheck = http(
  'healthCheck',
  Handler.use(errorHandler())
    .use(responseWrapper())
    .handle(async (_request: Request, response: Response) => {
      response.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
      });
    })
);

// Example protected endpoint
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export const createUser = http(
  'createUser',
  Handler.use(dependencyInjection())
    .use(bodyValidator(userSchema))
    .use(errorHandler())
    .use(responseWrapper())
    .handle(async (request: Request, response: Response) => {
      logger.info('Creating new user');

      const userData = request.body;
      // Here you would typically inject and use a UserService

      response.status(201).json({
        message: 'User created successfully',
        user: userData,
      });
    })
);
