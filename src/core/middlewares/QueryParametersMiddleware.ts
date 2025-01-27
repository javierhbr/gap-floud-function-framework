import { BaseMiddleware } from '../handler';
import { Context } from '../core';
import { ValidationError } from '../errors';

export class QueryParametersMiddleware implements BaseMiddleware {
  constructor(private readonly requiredParams: string[] = []) {}

  async before(context: Context): Promise<void> {
    const url = new URL(context.req.url, `http://${context.req.headers.host}`);
    context.req.query = Object.fromEntries(url.searchParams);

    for (const param of this.requiredParams) {
      if (!context.req.query[param]) {
        throw new ValidationError(`Missing required query parameter: ${param}`);
      }
    }
  }
}
