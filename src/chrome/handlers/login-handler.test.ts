// login-handler.test.ts
import 'reflect-metadata';
import { Container } from 'typedi';
import {
  loginHandler,
  verifyOtpHandler,
  requestOtpHandler,
} from './login-handler';
import {
  LoginRequest,
  VerifyOtpRequest,
  SentOtpRequest,
} from './dto/login.dto';
import { LoginApi } from './api/loginApi';

// Create a mock for LoginApi
const mockLoginApi = {
  login: jest.fn(),
  verifyOtp: jest.fn(),
  sendOtp: jest.fn(),
};

// Override Container.get to always return our mock
jest.spyOn(Container, 'get').mockImplementation((service) => {
  if (service === LoginApi) {
    return mockLoginApi;
  }
  throw new Error('Unexpected service');
});

// A helper function to create a dummy context with a proper res object
function createContext<TReq, TRes>(parsedBody: unknown = {}) {
  return {
    req: {
      parsedBody,
      body: parsedBody,
      headers: { authorization: 'Basic BASE64_ENCODED_CREDENTIALS' },
    },
    res: {
      locals: {},
      // The status function is needed by the error middleware.
      // It now returns this so that chaining works for .json(), etc.
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn().mockReturnThis(),
    } as any,
  };
}

describe('Login handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loginHandler calls loginApi.login and sets response', async () => {
    const loginRequest: LoginRequest = {
      email: 'test@test.com',
      password: 'secret',
      channel: 'web',
    };
    const expectedResponse = { user: 'mockUserId', token: 'mockToken123' };
    mockLoginApi.login.mockResolvedValue(expectedResponse);
    const context = createContext(loginRequest);

    await loginHandler.execute(context.req as any, context.res as any);

    expect(mockLoginApi.login).toHaveBeenCalledWith(loginRequest);
    expect(context.res.locals.responseBody).toEqual(expectedResponse);
  });

  test('verifyOtpHandler calls loginApi.verifyOtp and sets response', async () => {
    const verifyOtpReq: VerifyOtpRequest = {
      email: 'test@test.com',
      verification: '12345',
    };
    const expectedResponse = { email: 'testUser', token: 'abc123' };
    mockLoginApi.verifyOtp.mockResolvedValue(expectedResponse);
    const context = createContext(verifyOtpReq);

    await verifyOtpHandler.execute(context.req as any, context.res as any);

    expect(mockLoginApi.verifyOtp).toHaveBeenCalledWith(verifyOtpReq);
    expect(context.res.locals.responseBody).toEqual(expectedResponse);
  });

  test('requestOtpHandler calls loginApi.sendOtp and sets response', async () => {
    const sentOtpReq: SentOtpRequest = {
      email: 'test@test.com',
    };
    const expectedResponse = { success: true }; // using a placeholder response
    mockLoginApi.sendOtp.mockResolvedValue(expectedResponse);
    const context = createContext(sentOtpReq);

    await requestOtpHandler.execute(context.req as any, context.res as any);

    expect(mockLoginApi.sendOtp).toHaveBeenCalledWith(sentOtpReq);
    expect(context.res.locals.responseBody).toEqual(expectedResponse);
  });

  test('loginHandler returns error response when parsedBody is missing', async () => {
    const context = createContext(undefined);

    // Instead of expecting a rejected promise, we execute the handler and verify that error middleware processed the error.
    await loginHandler.execute(context.req as any, context.res as any);

    // Check that the error response was sent.
    expect(context.res.status).toHaveBeenCalledWith(expect.any(Number));
    expect(context.res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Validation error'),
        details: expect.any(Array),
      })
    );
  });

  test('requestOtpHandler returns error response when parsedBody is missing', async () => {
    const context = createContext(undefined);

    await requestOtpHandler.execute(context.req as any, context.res as any);

    expect(context.res.status).toHaveBeenCalledWith(expect.any(Number));
    expect(context.res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Validation error'),
        details: expect.any(Array),
      })
    );
  });
});
