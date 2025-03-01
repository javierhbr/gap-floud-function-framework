import 'reflect-metadata';
import { Container } from 'typedi';
import { memberMessageHandler } from './member-chat-handler';
import { ChatRequestType, ChatResponseType } from './dto/message.dto';
import {
  CustomRequest,
  CustomResponse,
  Context,
  BusinessError,
} from '@noony/core';
import { MemberChatApi } from './api/memberChatApi';

// Create a mock for MemberChatApi
const mockMemberChatApi = {
  replyMemberMessages: jest.fn(),
  getMemberHistoryMessages: jest.fn(),
};

// Override Container.get to return our mock
jest.spyOn(Container, 'get').mockImplementation((service) => {
  if (service === MemberChatApi) {
    return mockMemberChatApi;
  }
  throw new Error('Unexpected service');
});

describe('memberMessageHandler', () => {
  const createTestContext = (body: Partial<ChatRequestType> = {}): Context => {
    const req = {
      parsedBody: body,
      body,
      headers: { authorization: 'Bearer test-token' },
      get: jest.fn(),
      header: jest.fn(),
      accepts: jest.fn(),
      acceptsCharsets: jest.fn(),
      acceptsEncodings: jest.fn(),
      acceptsLanguages: jest.fn(),
    } as unknown as CustomRequest;

    const res = {
      locals: {
        responseBody: undefined,
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as CustomResponse;

    return {
      req,
      res,
      businessData: new Map<string, unknown>(),
    };
  };

  beforeEach(() => {
    // Clear all mocks between tests
    jest.clearAllMocks();
    mockMemberChatApi.replyMemberMessages.mockReset();
    mockMemberChatApi.getMemberHistoryMessages.mockReset();
  });

  describe('happy path', () => {
    it('should process valid chat request successfully', async () => {
      const request: ChatRequestType = {
        contextId: 'test-123',
        message: 'Test message',
      };

      const response: ChatResponseType = {
        contextId: 'test-123',
        dateTime: '2024-01-01T00:00:00Z',
        replyMessage: 'Response',
        links: [],
      };

      mockMemberChatApi.replyMemberMessages.mockResolvedValue(response);
      const context = createTestContext(request);

      await memberMessageHandler.execute(context.req, context.res);

      expect(mockMemberChatApi.replyMemberMessages).toHaveBeenCalledWith(
        request
      );
      expect(context.res.locals.responseBody).toEqual(response);
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      const request: ChatRequestType = {
        contextId: 'test-123',
        message: 'Test message',
      };

      mockMemberChatApi.replyMemberMessages.mockRejectedValue(
        new BusinessError('API Error')
      );
      const context = createTestContext(request);

      await memberMessageHandler.execute(context.req, context.res);

      expect(context.res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(context.res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          payload: expect.objectContaining({
            error: expect.stringContaining('API Error'),
          }),
          timestamp: expect.any(String),
        })
      );
    });

    it('should handle validation errors', async () => {
      const invalidRequest = {};
      const context = createTestContext(invalidRequest);

      await memberMessageHandler.execute(context.req, context.res);

      expect(context.res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(context.res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          payload: expect.objectContaining({
            error: 'Validation error',
            details: expect.arrayContaining([
              expect.objectContaining({
                code: 'invalid_type',
                message: 'Required',
                path: expect.any(Array),
              }),
            ]),
          }),
          timestamp: expect.any(String),
        })
      );
    });

    it('should handle missing authorization', async () => {
      const context = createTestContext({
        contextId: 'test-123',
        message: 'Test',
      });
      if (context.req.headers) {
        context.req.headers.authorization = '';
      }

      await memberMessageHandler.execute(context.req, context.res);

      expect(context.res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(context.res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          payload: expect.objectContaining({
            error: 'Missing or invalid bearer token',
          }),
          timestamp: expect.any(String),
        })
      );
    });
  });
});
