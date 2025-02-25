import 'reflect-metadata';
import {
  Handler,
  bodyValidator,
  dependencyInjection,
  errorHandler,
  responseWrapperMiddleware,
} from '@noony/core';
import { pathParamValidator } from '../../index';
import {
  LoginRequestSchema,
  LoginRequestType,
  LoginResponseType,
} from './dto/login.dto';
import {
  basicAuthMiddleware,
  bearerAuthMiddleware,
} from '../middleware/auth-custom.middleware';
import { bodyParser } from '@noony/core';
import { User } from '../domain/user';

// Handlers
const loginHandler = Handler.use<LoginRequestType, User>(dependencyInjection())
  .use(bodyValidator<LoginRequestType>(LoginRequestSchema))
  .use(basicAuthMiddleware)
  .use(bodyParser<LoginRequestType>())
  .use(errorHandler())
  .use(responseWrapperMiddleware<LoginResponseType>())
  .handle(async (context) => {
    const body = context.req.parsedBody;

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
