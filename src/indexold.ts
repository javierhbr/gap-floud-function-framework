import 'reflect-metadata';
import express from 'express';
import { Container } from 'typedi';
import { z } from 'zod';
import { UserQueryParams } from './users/http.types';
import {
  logger,
  Handler,
  CustomRequest,
  CustomResponse,
  validatedQueryParameters,
  bodyValidator,
  dependencyInjection,
  headerVariablesValidator,
  BaseMiddleware,
  Context,
  HttpError,
  errorHandler,
  responseWrapperMiddleware,
} from '@noony/core';
import { UserService } from './users/user.service';

import { onRequest } from 'firebase-functions/https';

Container.set('businessData', new Map<string, any>());

const app = express();
app.use(express.json());

// Schemas
const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
});

export const pathParamValidator = (params: string[]): BaseMiddleware => ({
  before: async (context: Context) => {
    const missingParams = params.filter((param) => !context.req.params[param]);
    if (missingParams.length > 0) {
      throw new HttpError(
        400,
        `Missing path parameters: ${missingParams.join(', ')}`
      );
    }
  },
});

// List users handler with query parameters
const listUsersHandler = Handler.use(dependencyInjection())
  .use(
    validatedQueryParameters(
      z.object({
        age: z.preprocess(
          (val) => (val ? parseInt(val as string, 10) : undefined),
          z.number().optional()
        ),
        active: z.preprocess(
          (val) => (val ? val === 'true' : undefined),
          z.boolean().optional()
        ),
      })
    )
  )
  .use(errorHandler())
  .use(responseWrapperMiddleware<any>())
  .handle(async (context) => {
    const queryParams = context.req.query as UserQueryParams;
    const users = await Container.get(UserService).listUsers(queryParams);
    context.res.locals.responseBody = users;
  });

// Get user by ID handler with path parameter
const getUserHandler = Handler.use(dependencyInjection())
  .use(pathParamValidator(['userId']))
  .use(errorHandler())
  .use(responseWrapperMiddleware<any>())
  .handle(async (context: Context) => {
    const { userId } = context.req.params;
    logger.info(`Getting user ${JSON.stringify(context.req.params)}`);
    const user = await Container.get(UserService).getUser(userId);
    context.res.locals.responseBody = user;
  });

// Create user handler
const createUserHandler = Handler.use(dependencyInjection())
  .use(bodyValidator(createUserSchema))
  .use(headerVariablesValidator(['content-type']))
  .use(errorHandler())
  .use(responseWrapperMiddleware<any>())
  .handle(async (context) => {
    const user = await Container.get(UserService).createUser(context.req.body);
    context.res.locals.responseBody = user;
    context.res.status(201);
  });

// Health check handler
const healthCheckHandler = Handler.use(errorHandler())
  .use(responseWrapperMiddleware<any>())
  .handle(async (context) => {
    context.res.locals.responseBody = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  });

// Route definitions
app.get('/api/users', (req, res) =>
  listUsersHandler.execute(
    req as unknown as CustomRequest,
    res as unknown as CustomResponse
  )
);
app.get('/api/users/:userId', (req, res) =>
  getUserHandler.execute(
    req as unknown as CustomRequest,
    res as unknown as CustomResponse
  )
);
app.post('/api/users', (req, res) =>
  createUserHandler.execute(
    req as unknown as CustomRequest,
    res as unknown as CustomResponse
  )
);
app.get('/health', (req, res) =>
  healthCheckHandler.execute(
    req as unknown as CustomRequest,
    res as unknown as CustomResponse
  )
);

// Export the function
// exports.userApi = functions.http('userApi', app);
exports.userApi = onRequest(app);
