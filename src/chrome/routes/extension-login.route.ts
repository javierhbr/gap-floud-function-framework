import 'reflect-metadata';
import express from 'express';
import { CustomRequest, CustomResponse } from '@noony/core';
import { onRequest } from 'firebase-functions/https';
import { loginHandler } from '../handlers/login-handler';
import { LoginRequestType } from '../handlers/dto/login.dto';

const app = express();
app.use(express.json());

app.post('/login', (req, res) =>
  loginHandler.execute(
    req as unknown as CustomRequest<LoginRequestType>,
    res as unknown as CustomResponse
  )
);

// Export the function
exports.loginApi = onRequest(app);
