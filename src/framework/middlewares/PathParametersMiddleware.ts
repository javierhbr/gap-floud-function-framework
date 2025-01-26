import { Context } from './base/Middleware';
import { BaseMiddleware } from '../../core/handler';

export class PathParametersMiddleware implements BaseMiddleware {
  async before(context: Context): Promise<void> {
    const url = new URL(context.req.url, `http://${context.req.headers.host}`);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    context.req.params = context.req.params || {};

    // Extract path parameters based on your routing configuration
    // This is a simplified example
    pathSegments.forEach((segment, index) => {
      if (segment.startsWith(':')) {
        const paramName = segment.slice(1);
        context.req.params[paramName] = pathSegments[index];
      }
    });
  }
}
