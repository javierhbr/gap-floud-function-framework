export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  token?: string;
  otp?: string;
  verified: boolean;
}

export interface UserTokenPayload {
  id: string;
  email: string;
  name?: string;
  expiration: Date;
  type: string;
  encrypted?: unknown;
  verified: boolean;
}
