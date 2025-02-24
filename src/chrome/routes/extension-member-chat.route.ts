import 'reflect-metadata';
import express from 'express';
import { CustomRequest, CustomResponse } from '@noony/core';
import { onRequest } from 'firebase-functions/https';
import {
  memberHistoryMessageHandler,
  memberMessageHandler,
} from '../handlers/member-chat-handler';

const app = express();
app.use(express.json());

app.post('/messages/history/:userId', (req, res) =>
  memberHistoryMessageHandler.execute(
    req as unknown as CustomRequest,
    res as unknown as CustomResponse
  )
);

app.post('/messages', (req, res) =>
  memberMessageHandler.execute(
    req as unknown as CustomRequest,
    res as unknown as CustomResponse
  )
);
// Export the function
exports.chromeApi = onRequest(app);
