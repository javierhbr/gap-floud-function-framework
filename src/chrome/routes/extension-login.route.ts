import 'reflect-metadata';
import express from 'express';
import { CustomRequest, CustomResponse } from '@noony/core';
import { onRequest } from 'firebase-functions/https';
import { loginHandler } from '../handlers/login-handler';

const app = express();
app.use(express.json());

// Route definitions
app.post('/login', (req, res) =>
  loginHandler.execute(
    req as unknown as CustomRequest,
    res as unknown as CustomResponse
  )
);

// Export the function
exports.loginApi = onRequest(app);
