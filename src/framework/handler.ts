import { Request, Response } from '@google-cloud/functions-framework';

type Middleware = (req: Request, res: Response, next: () => Promise<void>) => Promise<void>;
type RequestHandler = (req: Request, res: Response) => Promise<void>;

export class Handler {
  private middlewares: Middleware[] = [];

  private constructor() {}

  static use(middleware: Middleware): Handler {
    const handler = new Handler();
    return handler.use(middleware);
  }

  use(middleware: Middleware): Handler {
    this.middlewares.push(middleware);
    return this;
  }

  handle(requestHandler: RequestHandler): (req: Request, res: Response) => Promise<void> {
    return async (req: Request, res: Response) => {
      let currentMiddlewareIndex = 0;

      const executeMiddleware = async (): Promise<void> => {
        if (currentMiddlewareIndex < this.middlewares.length) {
          const middleware = this.middlewares[currentMiddlewareIndex];
          currentMiddlewareIndex++;
          await middleware(req, res, executeMiddleware);
        } else {
          await requestHandler(req, res);
        }
      };

      await executeMiddleware();
    };
  }
}
