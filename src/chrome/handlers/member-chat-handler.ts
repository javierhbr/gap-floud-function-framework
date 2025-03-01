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
} from './dto/message.dto';
import { Container } from 'typedi';
import { MemberChatApi } from './api/memberChatApi';
import { User } from '../domain/user';
import { Context } from '../../../../noony/noony-core/build';

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

const memberMessageHandler = new Handler<ChatRequestType, User>()
  .use(dependencyInjection())
  .use(bearerAuthMiddleware)
  .use(bodyValidator(ChatRequestApiSchema))
  .use(errorHandler())
  .use(responseWrapperMiddleware())
  .handle(async (context: Context) => {
    const memberChatApi = Container.get(MemberChatApi);
    context.res.locals.responseBody = await memberChatApi.replyMemberMessages(
      context.user as User,
      context.req.parsedBody as ChatRequestType
    );
  });

export { memberHistoryMessageHandler, memberMessageHandler };
