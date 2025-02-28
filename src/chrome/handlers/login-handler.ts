import 'reflect-metadata';
import {
  Handler,
  bodyValidator,
  dependencyInjection,
  errorHandler,
  responseWrapperMiddleware,
} from '@noony/core';
import {
  LoginRequest,
  LoginRequestSchema,
} from './dto/login.dto';
import {
  basicAuthMiddleware,
  bearerAuthMiddleware,
} from '../middleware/auth-custom.middleware';
import { bodyParser } from '@noony/core';
import { Container } from 'typedi';
import { LoginApi } from './api/loginApi';

const loginHandler = Handler.use(dependencyInjection())
  .use(bodyValidator(LoginRequestSchema))
  .use(basicAuthMiddleware)
  .use(bodyParser())
  .use(errorHandler())
  .use(responseWrapperMiddleware())
  .handle(async (context) => {
    const loginApi = Container.get(LoginApi);

    if (!context.req.parsedBody) {
      throw new Error('Missing request body');
    }

    const response = await loginApi.login(
      context.req.parsedBody as LoginRequest
    );
    context.res.locals.responseBody = response;
  });

const verifyOtpHandler = Handler.use(dependencyInjection())
  .use(basicAuthMiddleware)
  .use(errorHandler())
  .use(responseWrapperMiddleware<any>())
  .handle(async (context) => {
    const body: any = context.req.body;
    // Add your authentication logic
    console.log(`verifyOtpHandler: ${body}`);
  });

const requestOtpHandler = Handler.use(dependencyInjection())
  .use(bearerAuthMiddleware)
  .use(errorHandler())
  .use(responseWrapperMiddleware<any>())
  .handle(async (context) => {
    const body: any = context.req.body;
    // Add your authentication logic
    console.log(`requestOtpHandler: ${body}`);
  });

export { loginHandler, verifyOtpHandler, requestOtpHandler };
