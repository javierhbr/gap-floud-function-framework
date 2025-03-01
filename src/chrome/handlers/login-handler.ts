import 'reflect-metadata';
import {
  bodyParser,
  bodyValidator,
  dependencyInjection,
  errorHandler,
  Handler,
  responseWrapperMiddleware,
} from '@noony/core';
import {
  LoginRequest,
  LoginRequestSchema,
  LoginRequestType,
  LoginResponseType,
  SentOtpRequest,
  SentOtpRequestSchema,
  VerifyOtpRequest,
  VerifyOtpRequestSchema,
  VerifyOtpRequestType,
  VerifyOtpResponse,
} from './dto/login.dto';
import { basicAuthMiddleware } from '../middleware/auth-custom.middleware';
import { Container } from 'typedi';
import { LoginApi } from './api/loginApi';
import { BaseResponseType } from './dto/generic.dto';

const loginHandler = new Handler<LoginRequestType, LoginResponseType>()
  .use(dependencyInjection())
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

    context.res.locals.responseBody = await loginApi.login(
      context.req.parsedBody as LoginRequest
    );
  });

const verifyOtpHandler = new Handler<VerifyOtpRequestType, VerifyOtpResponse>()
  .use(dependencyInjection())
  .use(bodyValidator(VerifyOtpRequestSchema))
  .use(basicAuthMiddleware)
  .use(bodyParser())
  .use(errorHandler())
  .use(responseWrapperMiddleware())
  .handle(async (context) => {
    const loginApi = Container.get(LoginApi);
    context.res.locals.responseBody = await loginApi.verifyOtp(
      context.req.parsedBody as VerifyOtpRequest
    );
  });

const requestOtpHandler = new Handler<SentOtpRequest, BaseResponseType>()
  .use(dependencyInjection())
  .use(bodyValidator(SentOtpRequestSchema))
  .use(basicAuthMiddleware)
  .use(errorHandler())
  .use(responseWrapperMiddleware())
  .handle(async (context) => {
    const loginApi = Container.get(LoginApi);

    if (!context.req.parsedBody) {
      throw new Error('Missing request body');
    }

    context.res.locals.responseBody = await loginApi.sendOtp(
      context.req.parsedBody as SentOtpRequest
    );
  });

export { loginHandler, verifyOtpHandler, requestOtpHandler };
