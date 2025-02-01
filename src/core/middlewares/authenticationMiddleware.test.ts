// src/core/middlewares/authenticationMiddleware.test.ts
import {
  AuthenticationMiddleware,
  CustomTokenVerificationPort,
  verifyAuthTokenMiddleware,
} from './authenticationMiddleware';
import { Context } from '../core';
import { AuthenticationError, HttpError } from '../errors';

describe('AuthenticationMiddleware', () => {
  let context: Context;
  let tokenVerificationPort: CustomTokenVerificationPort<any>;

  beforeEach(() => {
    context = {
      req: { headers: {} },
      res: {},
      container: null,
      error: null,
      businessData: new Map(),
    } as unknown as Context;
    tokenVerificationPort = { verifyToken: jest.fn() };
  });

  it('throws HttpError if no authorization header is present', async () => {
    const middleware = new AuthenticationMiddleware(tokenVerificationPort);

    await expect(middleware.before(context)).rejects.toThrow(HttpError);
    await expect(middleware.before(context)).rejects.toThrow(
      'No authorization header'
    );
  });

  it('throws AuthenticationError if token format is invalid', async () => {
    context.req.headers.authorization = 'InvalidTokenFormat';
    const middleware = new AuthenticationMiddleware(tokenVerificationPort);

    await expect(middleware.before(context)).rejects.toThrow(
      AuthenticationError
    );
    await expect(middleware.before(context)).rejects.toThrow(
      'Invalid token format'
    );
  });

  it('sets context.user if token is valid', async () => {
    const user = { id: 'user1' };
    tokenVerificationPort.verifyToken = jest.fn().mockResolvedValue(user);
    context.req.headers.authorization = 'Bearer validToken';
    const middleware = new AuthenticationMiddleware(tokenVerificationPort);

    await middleware.before(context);

    expect(context.user).toBe(user);
  });

  it('throws AuthenticationError if token verification fails', async () => {
    tokenVerificationPort.verifyToken = jest
      .fn()
      .mockRejectedValue(new Error('Invalid token'));
    context.req.headers.authorization = 'Bearer invalidToken';
    const middleware = new AuthenticationMiddleware(tokenVerificationPort);

    await expect(middleware.before(context)).rejects.toThrow(
      AuthenticationError
    );
    await expect(middleware.before(context)).rejects.toThrow(
      'Invalid authentication'
    );
  });

  it('rethrows HttpError if token verification throws HttpError', async () => {
    const httpError = new HttpError(403, 'Forbidden');
    tokenVerificationPort.verifyToken = jest.fn().mockRejectedValue(httpError);
    context.req.headers.authorization = 'Bearer invalidToken';
    const middleware = new AuthenticationMiddleware(tokenVerificationPort);

    await expect(middleware.before(context)).rejects.toThrow(HttpError);
    await expect(middleware.before(context)).rejects.toThrow('Forbidden');
  });
});

describe('verifyAuthTokenMiddleware', () => {
  let context: Context;
  let tokenVerificationPort: { verifyToken: jest.Mock };

  beforeEach(() => {
    context = {
      req: { headers: {} },
      res: {},
      container: null,
      error: null,
      businessData: new Map(),
    } as unknown as Context;
    tokenVerificationPort = { verifyToken: jest.fn() };
  });

  it('throws HttpError if no authorization header is present', async () => {
    const middleware = verifyAuthTokenMiddleware(tokenVerificationPort);

    if (middleware.before) {
      await expect(middleware.before(context)).rejects.toThrow(HttpError);
      await expect(middleware.before(context)).rejects.toThrow(
        'No authorization header'
      );
    }
  });

  it('throws AuthenticationError if token format is invalid', async () => {
    context.req.headers.authorization = 'InvalidTokenFormat';
    const middleware = verifyAuthTokenMiddleware(tokenVerificationPort);

    if (middleware.before) {
      await expect(middleware.before(context)).rejects.toThrow(
        AuthenticationError
      );
      await expect(middleware.before(context)).rejects.toThrow(
        'Invalid token format'
      );
    }
  });

  it('sets context.user if token is valid', async () => {
    const user = { id: 'user1' };
    tokenVerificationPort.verifyToken.mockResolvedValue(user);
    context.req.headers.authorization = 'Bearer validToken';
    const middleware = verifyAuthTokenMiddleware(tokenVerificationPort);

    if (middleware.before) {
      await middleware.before(context);
      expect(context.user).toBe(user);
    }
  });

  it('throws AuthenticationError if token verification fails', async () => {
    tokenVerificationPort.verifyToken.mockRejectedValue(
      new Error('Invalid token')
    );
    context.req.headers.authorization = 'Bearer invalidToken';
    const middleware = verifyAuthTokenMiddleware(tokenVerificationPort);

    if (middleware.before) {
      await expect(middleware.before(context)).rejects.toThrow(
        AuthenticationError
      );
      await expect(middleware.before(context)).rejects.toThrow(
        'Invalid authentication'
      );
    }
  });

  it('rethrows HttpError if token verification throws HttpError', async () => {
    const httpError = new HttpError(403, 'Forbidden');
    tokenVerificationPort.verifyToken.mockRejectedValue(httpError);
    context.req.headers.authorization = 'Bearer invalidToken';
    const middleware = verifyAuthTokenMiddleware(tokenVerificationPort);

    if (middleware.before) {
      await expect(middleware.before(context)).rejects.toThrow(HttpError);
      await expect(middleware.before(context)).rejects.toThrow('Forbidden');
    }
  });
});
