import { Service } from 'typedi';
import { ChatAsk, ChatReply } from '../domain/message';
import { User } from '../domain/user';

@Service()
export class MemberChatService {
  replyMemberMessages(user: User, ChatRequest: ChatAsk): Promise<ChatReply> {
    return Promise.resolve({
      contextId: ChatRequest.contextId,
      dateTime: new Date(),
      replyMessage: 'This is a mock reply to your message.',
      links: [
        {
          title: 'Mock Link',
          url: 'https://example.com',
        },
      ],
      warning: undefined,
      error: undefined,
    });
  }

  async getMemberHistoryMessages(_email: string): Promise<ChatReply[]> {
    return [
      {
        contextId: 'context-1',
        dateTime: new Date(),
        replyMessage: 'This is a mock message from the history.',
        links: [
          {
            title: 'Example Link 1',
            url: 'https://example.com/link1',
          },
        ],
        warning: undefined,
        error: undefined,
      },
      {
        contextId: 'context-2',
        dateTime: new Date(),
        replyMessage: 'Another mock message from the history.',
        links: [
          {
            title: 'Example Link 2',
            url: 'https://example.com/link2',
          },
        ],
        warning: undefined,
        error: undefined,
      },
    ];
  }
}
