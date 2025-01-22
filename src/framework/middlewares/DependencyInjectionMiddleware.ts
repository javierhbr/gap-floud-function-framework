import { Container } from 'typedi';
import { BaseMiddleware } from '@core/handler';
import { Context } from '@framework/middlewares/base/Middleware';

export class DependencyInjectionMiddleware implements BaseMiddleware {
  private static container: Container;

  async before(context: Context): Promise<void> {
    if (!DependencyInjectionMiddleware.container) {
      DependencyInjectionMiddleware.container = Container.of();
    }
    context.container = DependencyInjectionMiddleware.container;
  }
}
