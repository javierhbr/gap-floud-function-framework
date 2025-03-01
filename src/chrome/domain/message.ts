import { Error, Link, Warning } from './genericDomain';

export interface ChatAsk {
  contextId: string;
  message: string;
}

export interface ChatReply {
  contextId: string;
  dateTime: Date;
  replyMessage: string;
  links?: Link[];
  warning?: Warning;
  error?: Error;
}
