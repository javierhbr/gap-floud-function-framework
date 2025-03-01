import 'reflect-metadata';
import {
  Handler,
  dependencyInjection,
  errorHandler,
  bodyValidator,
  responseWrapperMiddleware,
} from '@noony/core';
import { bearerAuthMiddleware } from '../middleware/auth-custom.middleware';
import {
  ChatRequestApiSchema,
  ChatRequestType,
  ChatResponseApi,
  ChatResponseType,
} from './dto/message.dto';
import { Container } from 'typedi';
import { MemberChatApi } from './api/memberChatApi';
import { User } from '../domain/user';

const memberHistoryMessageHandler = new Handler<User, ChatResponseApi[]>()
  .use(dependencyInjection())
  .use(bearerAuthMiddleware)
  .use(errorHandler())
  .use(responseWrapperMiddleware())
  .handle(async (context) => {
    const memberChatApi = Container.get(MemberChatApi);
    context.res.locals.responseBody =
      await memberChatApi.getMemberHistoryMessages(
        (context.user as User).email
      );
  });

const memberMessageHandler = new Handler<ChatRequestType, ChatResponseType>()
  .use(dependencyInjection())
  .use(bearerAuthMiddleware)
  .use(bodyValidator(ChatRequestApiSchema))
  .use(errorHandler())
  .use(responseWrapperMiddleware())
  .handle(async (context: any) => {
    const memberChatApi = Container.get(MemberChatApi);
    context.res.locals.responseBody = await memberChatApi.replyMemberMessages(
      context.req.parsedBody as ChatRequestType
    );
  });

export { memberHistoryMessageHandler, memberMessageHandler };
