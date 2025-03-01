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

app.post('/v1/messages/history/:userId', (req, res) =>
  memberHistoryMessageHandler.execute(
    req as unknown as CustomRequest,
    res as unknown as CustomResponse
  )
);

app.post('/v1/messages', (req, res) =>
  memberMessageHandler.execute(
    req as unknown as CustomRequest,
    res as unknown as CustomResponse
  )
);
// Export the function
exports.memberChat = onRequest(app);
