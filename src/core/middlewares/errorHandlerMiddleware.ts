import { BaseMiddleware } from '../handler';
import { Context } from '../core';
import { HttpError } from '../errors';
import { logger } from '../logger';

export class ErrorHandlerMiddleware implements BaseMiddleware {
  async onError(error: Error, context: Context): Promise<void> {
    logger.error('Error processing request', {
      errorMessage: error?.message,
      errorStack: error?.stack,
    });

    if (error instanceof HttpError) {
      context.res.status(error.status).json({
        error: error.message,
        details: error.details,
      });
    } else {
      context.res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }
}

export const errorHandler = (): BaseMiddleware => ({
  onError: async (error: Error, context: Context): Promise<void> => {
    logger.error('Error processing request', {
      errorMessage: error?.message,
      errorStack: error?.stack,
    });

    if (error instanceof HttpError) {
      context.res.status(error.status).json({
        error: error.message,
        details: error.details,
      });
    } else {
      context.res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  },
});
