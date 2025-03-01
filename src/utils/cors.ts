import cors from 'cors';
import express from 'express';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const ONE_DAY_IN_SECONDS = 86400;

interface CorsConfiguration {
  origin: string[];
  methods: HttpMethod[];
  allowedHeaders: string[];
  maxAge: number;
}

const corsConfiguration: CorsConfiguration = {
  origin: (() => {
    try {
      return (
        process.env.ALLOWED_ORIGINS?.split(',').filter(Boolean) || [
          'http://localhost:8080',
        ]
      );
    } catch (error) {
      console.warn(
        'Failed to parse ALLOWED_ORIGINS, using default value',
        error
      );
      return ['http://localhost:3000'];
    }
  })(),
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  maxAge: ONE_DAY_IN_SECONDS,
};

export const configureCors = (app: express.Application): void => {
  app.use(cors(corsConfiguration));
};
