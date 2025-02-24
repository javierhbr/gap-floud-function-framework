// Domain Interfaces
export interface Error {
  status?: number;
  code?: string;
  message?: string;
  details?: Record<string, any>;
}

export interface LoginRequest {
  email: string;
  password: string;
  channel: string;
}

export interface LoginResponse {
  user?: string;
  token?: string;
  error?: Error;
}

export interface ChatRequest {
  contextId: string;
  message: string;
}

export interface Link {
  title?: string;
  url?: string;
}

export interface Warning {
  type?: string;
  message?: string;
}

export interface ChatResponse {
  contextId?: string;
  dateTime?: string;
  replyMessage?: string;
  links?: Link[];
  warning?: Warning;
  error?: Error;
}

export interface BaseResponse {
  error?: Error;
}
