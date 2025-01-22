import { http, Request, Response } from '@google-cloud/functions-framework';

import { z } from 'zod';
import { logger } from './utils/logger';
import {
  bodyParser,
  bodyValidator,
  dependencyInjection,
  authentication,
  headerVariables,
  pathParameters,
  queryParameters,
  errorHandler,
  responseWrapper,
} from './framework/middlewares';
import { Handler } from '@core/handler';

// Request schema validation
const helloWorldSchema = z.object({
  name: z.string().optional(),
});

const helloWorldHandler = Handler.use(dependencyInjection())
  .use(bodyValidator(helloWorldSchema))
  .use(errorHandler())
  .use(responseWrapper())
  .handle(async (context) => {
    logger.info('Hello logs!', { structuredData: true });
    const name = context.req.body?.name || 'World';
    context.res.json({
      message: `Hello, ${name}!`,
      timestamp: new Date().toISOString(),
    });
  });

// Hello World endpoint
export const helloWorld = http('helloWorld', (req: Request, res: Response): Promise<void> => {
  return helloWorldHandler.execute(req, res);
});

// Health check endpoint
const healthCheckHandler = Handler.use(errorHandler())
  .use(responseWrapper())
  .handle(async (context) => {
    context.res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

export const healthCheck = http('healthCheck', (req: Request, res: Response): Promise<void> => {
  return healthCheckHandler.execute(req, res);
});

// Example protected endpoint
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const verifyToken = async (_token: string): Promise<unknown> => {
  // Implement your token verification logic
  return { userId: '123' };
};

// Create handler
const createUserHandler = Handler.use(dependencyInjection())
  .use(bodyParser())
  .use(authentication(verifyToken))
  .use(headerVariables(['content-type']))
  .use(pathParameters())
  .use(queryParameters())
  .use(bodyValidator(userSchema))
  .use(errorHandler())
  .use(responseWrapper())
  .handle(async (context) => {
    const { name, email } = context.req.body as { name: string; email: string };
    context.res.status(201).json({ name, email });
  });

export const createUser = http('createUser', (req: Request, res: Response): Promise<void> => {
  return createUserHandler.execute(req, res);
});
