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
import { bodyParser } from '@noony/core';
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

    console.log(JSON.stringify(context.req));
    if (!context.req.parsedBody) {
      throw new Error('Missing request body');
    }

    const response = await loginApi.login(
      context.req.parsedBody as LoginRequest
    );
    context.res.locals.responseBody = response;
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
    const response = await loginApi.verifyOtp(
      context.req.parsedBody as VerifyOtpRequest
    );
    context.res.locals.responseBody = response;
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

    const response = await loginApi.sendOtp(
      context.req.parsedBody as SentOtpRequest
    );
    context.res.locals.responseBody = response;
  });

export { loginHandler, verifyOtpHandler, requestOtpHandler };
