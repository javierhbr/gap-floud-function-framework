import 'reflect-metadata';
import {
  Handler,
  bodyValidator,
  dependencyInjection,
  errorHandler,
  responseWrapperMiddleware,
} from '@noony/core';
import { pathParamValidator } from '../../index';
import { LoginRequestSchema } from './dto/login.dto';
import {
  basicAuthMiddleware,
  bearerAuthMiddleware,
} from '../middleware/auth-custom.middleware';

// Handlers
const loginHandler = Handler.use(dependencyInjection())
  .use(bodyValidator(LoginRequestSchema))
  .use(basicAuthMiddleware)
  .use(errorHandler())
  .use(responseWrapperMiddleware<any>())
  .handle(async (context) => {
    // Implement login-handler.ts logic here
    const body: any = context.req.body;
    // Add your authentication logic
    console.log(`memberHistoryMessageHandler: ${body}`);
  });

const verifyOtpHandler = Handler.use(dependencyInjection())
  .use(basicAuthMiddleware)
  .use(pathParamValidator(['userId']))
  .use(errorHandler())
  .use(responseWrapperMiddleware<any>())
  .handle(async (context) => {
    const body: any = context.req.body;
    // Add your authentication logic
    console.log(`verifyOtpHandler: ${body}`);
  });

const requestOtpHandler = Handler.use(dependencyInjection())
  .use(bearerAuthMiddleware)
  .use(pathParamValidator(['userId']))
  .use(errorHandler())
  .use(responseWrapperMiddleware<any>())
  .handle(async (context) => {
    const body: any = context.req.body;
    // Add your authentication logic
    console.log(`requestOtpHandler: ${body}`);
  });

export { loginHandler, verifyOtpHandler, requestOtpHandler };
