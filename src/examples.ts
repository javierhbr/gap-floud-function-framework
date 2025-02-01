import * as functions from 'firebase-functions';
import { http, Request, Response } from '@google-cloud/functions-framework';

import { z } from 'zod';
import { logger } from './core/logger';
import {
  bodyParser,
  bodyValidator,
  dependencyInjection,
  headerVariablesValidator,
  pathParameters,
  errorHandler,
  responseWrapperV2,
  verifyAuthTokenMiddleware,
} from './core/middlewares';
import { Handler } from './core/handler';
import { TokenPayload } from './core';
import { jwtTokenVerificationPort } from './utils/auth';

// Request schema validation
const helloWorldSchema = z.object({
  name: z.string().optional(),
});

const helloWorldHandler = Handler.use(dependencyInjection())
  .use(bodyValidator(helloWorldSchema))
  .use(errorHandler())
  .use(responseWrapperV2<any>())
  .handle(async (context) => {
    logger.info('Hello logs!', { structuredData: true });
    const name = context.req.body?.name || 'World';
    context.res.json({
      message: `Hello, ${name}!`,
      timestamp: new Date().toISOString(),
    });
  });

// Hello World endpoint
export const helloWorld = http(
  'helloWorld',
  (req: Request, res: Response): Promise<void> => {
    return helloWorldHandler.execute(req, res);
  }
);

// Health check endpoint
const healthCheckHandler = Handler.use(errorHandler())
  .use(responseWrapperV2<any>())
  .handle(async (context) => {
    context.res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

export const healthCheck = http(
  'healthCheck',
  (req: Request, res: Response): Promise<void> => {
    return healthCheckHandler.execute(req, res);
  }
);

// Example protected endpoint
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

// Create handler
const createUserHandler = Handler.use(dependencyInjection())
  .use(bodyParser())
  .use(verifyAuthTokenMiddleware<TokenPayload>(jwtTokenVerificationPort))
  .use(headerVariablesValidator(['content-type']))
  .use(pathParameters())
  .use(bodyValidator(userSchema))
  .use(errorHandler())
  .use(responseWrapperV2<any>())
  .handle(async (context) => {
    const { name, email } = context.req.body as { name: string; email: string };
    context.res.status(201).json({ name, email });
  });

export const createUser = http(
  'createUser',
  (req: Request, res: Response): Promise<void> => {
    return createUserHandler.execute(req, res);
  }
);

export const helloWorldV2 = functions.https.onRequest((req, res) => {
  logger.info(JSON.stringify(req.params));
  console.log(JSON.stringify(req.params));
  logger.info(JSON.stringify(req.query));
  console.log(JSON.stringify(req.query));

  if (req.method === 'GET') {
    res.send({ message: 'Hello, World!' });
    return;
  }

  if (req.method === 'POST') {
    const { name, lastName } = req.body;

    if (!name || !lastName) {
      res
        .status(400)
        .send({ error: 'Missing name or lastname in request body' });
      return;
    }

    res.send({ message: `Hello, ${name} ${lastName}!` });
    return;
  }

  res.status(405).send({ error: 'Method Not Allowed' });
});

/*
// POST operation
export const postHandler = (req: Request, res: Response) => {
  const data = req.body;
  // Handle the POST request
  res.status(201).send(`Data received: ${JSON.stringify(data)}`);
};

// PUT operation
export const putHandler = (req: Request, res: Response) => {
  const data = req.body;
  // Handle the PUT request
  res.status(200).send(`Data updated: ${JSON.stringify(data)}`);*/
