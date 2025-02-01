import Container from 'typedi';
import { Context, CustomRequest, CustomResponse } from './core';

export interface BaseMiddleware {
  before?: (context: Context) => Promise<void>;
  after?: (context: Context) => Promise<void>;
  onError?: (error: Error, context: Context) => Promise<void>;
}

export class Handler {
  private baseMiddlewares: BaseMiddleware[] = [];
  private handler!: (context: Context) => Promise<void>;

  static use(BaseMiddleware: BaseMiddleware): Handler {
    const handler = new Handler();
    handler.baseMiddlewares.push(BaseMiddleware);
    return handler;
  }

  use(BaseMiddleware: BaseMiddleware): Handler {
    this.baseMiddlewares.push(BaseMiddleware);
    return this;
  }

  handle(handler: (context: Context) => Promise<void>): Handler {
    this.handler = handler;
    return this;
  }

  async execute(req: CustomRequest, res: CustomResponse): Promise<void> {
    const context: Context = {
      container: Container.of(),
      req,
      res,
      error: null,
      businessData: new Map(),
    };

    try {
      // Execute before baseMiddlewares
      for (const BaseMiddleware of this.baseMiddlewares) {
        if (BaseMiddleware.before) {
          await BaseMiddleware.before(context);
        }
      }

      await this.handler(context);

      for (const BaseMiddleware of [...this.baseMiddlewares].reverse()) {
        if (BaseMiddleware.after) {
          await BaseMiddleware.after(context);
        }
      }
    } catch (error) {
      for (const BaseMiddleware of [...this.baseMiddlewares].reverse()) {
        if (BaseMiddleware.onError) {
          await BaseMiddleware.onError(error as Error, context);
        }
      }
    }
  }
}
