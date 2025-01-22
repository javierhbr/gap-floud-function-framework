import { Container } from 'typedi';
import { BaseMiddleware } from './base/Middleware';
import { Request, Response, NextFunction } from '@google-cloud/functions-framework';

export class DependencyInjectionMiddleware extends BaseMiddleware {
  private static container: Container;

  async before(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!DependencyInjectionMiddleware.container) {
      DependencyInjectionMiddleware.container = Container.of();
    }
    req.container = DependencyInjectionMiddleware.container;
    await next();
  }
}
