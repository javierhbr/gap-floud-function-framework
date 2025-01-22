import { Request, Response, NextFunction } from '@google-cloud/functions-framework';
import { Container } from 'typedi';

export type Middleware = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
export type HandlerFunction = (req: Request, res: Response) => Promise<void> | void;

export class Handler {
  private middlewares: Middleware[] = [];
  private static container: Container;

  static use(middleware: Middleware): Handler {
    const handler = new Handler();
    handler.middlewares.push(middleware);
    return handler;
  }

  use(middleware: Middleware): Handler {
    this.middlewares.push(middleware);
    return this;
  }

  handle(handlerFn: HandlerFunction): HandlerFunction {
    return async (req: Request, res: Response): Promise<void> => {
      const currentMiddlewareIndex = 0;

      const executeMiddleware = async (index: number): Promise<void> => {
        if (index === this.middlewares.length) {
          await handlerFn(req, res);
          return;
        }

        await this.middlewares[index](req, res, () => executeMiddleware(index + 1));
      };

      await executeMiddleware(currentMiddlewareIndex);
    };
  }
}
