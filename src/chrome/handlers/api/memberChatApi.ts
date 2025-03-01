import { Service } from 'typedi';
import { MemberChatService } from '../../services/memberChatService';
import {
  ChatRequestType,
  ChatResponseApi,
  ChatResponseType,
} from '../dto/message.dto';
import dayjs from 'dayjs';

@Service()
export class MemberChatApi {
  constructor(private memberChatService: MemberChatService) {}

  async replyMemberMessages(
    question: ChatRequestType
  ): Promise<ChatResponseType> {
    const response = await this.memberChatService.replyMemberMessages(question);

    // Ensure the dateTime is formatted as a string in ISO format with an offset
    return {
      ...response,
      dateTime:
        response.dateTime instanceof Date
          ? dayjs(response.dateTime).toISOString() // Converts Date to ISO string
          : response.dateTime, // Keep as string if already formatted
    };
  }

  async getMemberHistoryMessages(email: string): Promise<ChatResponseApi[]> {
    return await this.memberChatService.getMemberHistoryMessages(email);
  }
}
