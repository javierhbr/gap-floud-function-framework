import 'reflect-metadata';
import express from 'express';
import { CustomRequest, CustomResponse } from '@noony/core';
import { onRequest } from 'firebase-functions/https';
import { requestOtpHandler, verifyOtpHandler } from '../handlers/login-handler';
import {
  guestHistoryMessageHandler,
  guestMessageHandler,
} from '../handlers/guest-chat-handler';

const app = express();
app.use(express.json());

app.post('/guest/messages/history/:userId', (req, res) =>
  guestHistoryMessageHandler.execute(
    req as unknown as CustomRequest,
    res as unknown as CustomResponse
  )
);

app.post('/guest/messages', (req, res) =>
  guestMessageHandler.execute(
    req as unknown as CustomRequest,
    res as unknown as CustomResponse
  )
);

app.post('/guest/verify-otp', (req, res) =>
  verifyOtpHandler.execute(
    req as unknown as CustomRequest,
    res as unknown as CustomResponse
  )
);

app.post('/guest/request-otp', (req, res) =>
  requestOtpHandler.execute(
    req as unknown as CustomRequest,
    res as unknown as CustomResponse
  )
);

// Export the function
exports.guestChat = onRequest(app);
