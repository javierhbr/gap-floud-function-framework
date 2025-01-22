import { MiddlewareFunction, ErrorResponse } from '../types';
import { HttpError } from '../core/errors';

export const errorHandler = (): MiddlewareFunction => {
  return async (req, res, next) => {
    try {
      await next();
    } catch (error) {
      const response: ErrorResponse = {
        status: error instanceof HttpError ? error.status : 500,
        message: error instanceof Error ? error.message : 'Internal Server Error',
      };

      if (error instanceof HttpError) {
        if (error.code) response.code = error.code;
        if (error.details) response.details = error.details;
      }

      res.status(response.status).json(response);
    }
  };
};
