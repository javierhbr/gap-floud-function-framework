import 'reflect-metadata';
import { Container } from 'typedi';
import {
  memberHistoryMessageHandler,
  memberMessageHandler,
} from './member-chat-handler';
import {
  ChatRequestType,
  ChatResponseApi,
  ChatResponseType,
} from './dto/message.dto';
import {
  CustomRequest,
  CustomResponse,
  Context,
  BusinessError,
} from '@noony/core';
import { MemberChatApi } from './api/memberChatApi';
import { User, UserTokenPayload } from '../domain/user';
import { generateTokenByEmailForTesting } from '../../scripts/generateToken';
import { JwtUtil } from '../utils/jwtUtil';
import { convertToUserFromTokenPayload } from '../mappers/userMapper';

// Create a mock for MemberChatApi
const mockMemberChatApi = {
  replyMemberMessages: jest.fn(),
  getMemberHistoryMessages: jest.fn(),
};

const mockJwtUtil = {
  verifyToken: jest.fn(),
};

const defaultTestEmail = 'test@test.com';
const defaultAuthToken = generateTokenByEmailForTesting(defaultTestEmail);

const defaultMockTokenPayload: UserTokenPayload = {
  id: '123',
  email: defaultTestEmail,
  type: 'user',
  verified: true,
  expiration: new Date('2025-03-01T07:26:08.383Z'),
};
// Override Container.get to return our mock
jest.spyOn(Container, 'get').mockImplementation((service) => {
  if (service === MemberChatApi) {
    return mockMemberChatApi;
  }
  if (service === JwtUtil) {
    return mockJwtUtil;
  }
  throw new Error('Unexpected service');
});

describe('memberMessageHandler', () => {
  const createTestContext = (body: Partial<ChatRequestType> = {}): Context => {
    const req = {
      parsedBody: body,
      body,
      headers: { authorization: `Bearer ${defaultAuthToken}` },
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
    mockJwtUtil.verifyToken.mockReset();
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

      mockJwtUtil.verifyToken.mockResolvedValue(defaultMockTokenPayload);
      mockMemberChatApi.replyMemberMessages.mockResolvedValue(response);
      const context = createTestContext(request);

      await memberMessageHandler.execute(context.req, context.res);

      expect(mockMemberChatApi.replyMemberMessages).toHaveBeenCalledWith(
        expect.objectContaining(
          convertToUserFromTokenPayload(defaultMockTokenPayload)
        ),
        { contextId: 'test-123', message: 'Test message' }
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
            error: expect.stringContaining('Invalid or expired token'),
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
            error: expect.stringContaining('Invalid or expired token'),
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

describe('memberHistoryMessageHandler', () => {
  const createTestContext = (): Context => {
    const req = {
      headers: { authorization: `Bearer ${defaultAuthToken}` },
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
      user: { email: 'test@example.com' } as User,
    };
  };

  describe('happy path', () => {
    it('should retrieve chat history successfully', async () => {
      const mockResponse: ChatResponseApi[] = [
        {
          contextId: 'history-1',
          dateTime: new Date('2024-01-01T00:00:00Z'),
          replyMessage: 'Historic Response 1',
          links: [],
        },
        {
          contextId: 'history-2',
          dateTime: new Date('2024-01-01T00:00:00Z'),
          replyMessage: 'Historic Response 2',
          links: [],
        },
      ];
      mockJwtUtil.verifyToken.mockResolvedValue(defaultMockTokenPayload);
      mockMemberChatApi.getMemberHistoryMessages.mockResolvedValue(
        mockResponse
      );
      const context = createTestContext();

      await memberHistoryMessageHandler.execute(context.req, context.res);

      expect(mockMemberChatApi.getMemberHistoryMessages).toHaveBeenCalledWith(
        convertToUserFromTokenPayload(defaultMockTokenPayload)
      );
      expect(context.res.locals.responseBody).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      mockJwtUtil.verifyToken.mockResolvedValue(defaultMockTokenPayload);
      mockMemberChatApi.getMemberHistoryMessages.mockRejectedValue(
        new BusinessError('API Error')
      );
      const context = createTestContext();

      await memberHistoryMessageHandler.execute(context.req, context.res);

      expect(context.res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(context.res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          payload: expect.objectContaining({
            error: 'API Error',
          }),
          timestamp: expect.any(String),
        })
      );
    });

    it('should handle missing authorization', async () => {
      const context = createTestContext();
      if (context.req.headers) {
        context.req.headers.authorization = '';
      }

      await memberHistoryMessageHandler.execute(context.req, context.res);

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

    it('should handle missing user', async () => {
      const context = createTestContext();
      context.user = undefined;

      await memberHistoryMessageHandler.execute(context.req, context.res);

      expect(context.res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(context.res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          payload: expect.objectContaining({
            error: 'API Error',
          }),
          timestamp: expect.any(String),
        })
      );
    });
  });
});
