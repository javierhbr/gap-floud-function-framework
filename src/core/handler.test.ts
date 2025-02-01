import { Handler } from './handler';
import { Context, CustomRequest, CustomResponse } from './core';

describe('Handler', () => {
  let req: CustomRequest;
  let res: CustomResponse;

  beforeEach(() => {
    req = {} as CustomRequest;
    res = {} as CustomResponse;
  });

  it('executes handler successfully', async () => {
    const handler = Handler.use({
      before: jest.fn(),
      after: jest.fn(),
    }).handle(async (ctx: Context) => {
      ctx.res.statusCode = 200;
    });

    await handler.execute(req, res);
    expect(res.statusCode).toBe(200);
  });

  it('executes before middleware', async () => {
    const beforeMiddleware = jest.fn();
    const handler = Handler.use({
      before: beforeMiddleware,
    }).handle(async (ctx: Context) => {
      ctx.res.statusCode = 200;
    });

    await handler.execute(req, res);
    expect(beforeMiddleware).toHaveBeenCalled();
  });

  it('executes after middleware', async () => {
    const afterMiddleware = jest.fn();
    const handler = Handler.use({
      after: afterMiddleware,
    }).handle(async (ctx: Context) => {
      ctx.res.statusCode = 200;
    });

    await handler.execute(req, res);
    expect(afterMiddleware).toHaveBeenCalled();
  });

  it('executes onError middleware on error', async () => {
    const onErrorMiddleware = jest.fn();
    const handler = Handler.use({
      onError: onErrorMiddleware,
    }).handle(async () => {
      throw new Error('Test error');
    });

    await handler.execute(req, res);
    expect(onErrorMiddleware).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('executes all middlewares in order', async () => {
    const beforeMiddleware = jest.fn();
    const afterMiddleware = jest.fn();
    const onErrorMiddleware = jest.fn();
    const handler = Handler.use({
      before: beforeMiddleware,
      after: afterMiddleware,
      onError: onErrorMiddleware,
    }).handle(async (ctx: Context) => {
      ctx.res.statusCode = 200;
    });

    await handler.execute(req, res);
    expect(beforeMiddleware).toHaveBeenCalled();
    expect(afterMiddleware).toHaveBeenCalled();
    expect(onErrorMiddleware).not.toHaveBeenCalled();
  });

  it('handles error thrown in before middleware', async () => {
    const onErrorMiddleware = jest.fn();
    const handler = Handler.use({
      before: async () => {
        throw new Error('Before middleware error');
      },
      onError: onErrorMiddleware,
    }).handle(async (ctx: Context) => {
      ctx.res.statusCode = 200;
    });

    await handler.execute(req, res);
    expect(onErrorMiddleware).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('handles error thrown in after middleware', async () => {
    const onErrorMiddleware = jest.fn();
    const handler = Handler.use({
      after: async () => {
        throw new Error('After middleware error');
      },
      onError: onErrorMiddleware,
    }).handle(async (ctx: Context) => {
      ctx.res.statusCode = 200;
    });

    await handler.execute(req, res);
    expect(onErrorMiddleware).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('adds middleware using use method', () => {
    const middleware = { before: jest.fn() };
    const handler: Handler = new Handler().use(middleware);

    expect(handler).toBeInstanceOf(Handler);
    expect((handler as any).baseMiddlewares).toContain(middleware);
  });
});
