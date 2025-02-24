import 'reflect-metadata';
import {
  Handler,
  dependencyInjection,
  errorHandler,
  responseWrapperMiddleware,
} from '@noony/core';
import { bearerAuthMiddleware } from '../middleware/auth-custom.middleware';

const memberHistoryMessageHandler = Handler.use(dependencyInjection())
  .use(bearerAuthMiddleware)
  // .use(bodyValidator(chatRequestSchema))
  .use(errorHandler())
  .use(responseWrapperMiddleware<any>())
  .handle(async (context: any) => {
    const body = context.req.body;
    // Implement member message sending logic
    console.log(`memberHistoryMessageHandler: ${body}`);
  });

const memberMessageHandler = Handler.use(dependencyInjection())
  .use(bearerAuthMiddleware)
  // .use(bodyValidator(chatRequestSchema))
  .use(errorHandler())
  .use(responseWrapperMiddleware<any>())
  .handle(async (context: any) => {
    const body = context.req.body;
    // Implement member message sending logic
    console.log(`memberMessageHandler: ${body}`);
  });

export { memberHistoryMessageHandler, memberMessageHandler };
