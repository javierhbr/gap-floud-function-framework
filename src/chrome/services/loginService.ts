import { Service } from 'typedi';
import { LoginResponse } from '../domain/genericDomain';

@Service()
export class LoginService {
  constructor() {}

  async login(email: string, password: string): Promise<LoginResponse> {
    console.log(`LoginService.login: ${JSON.stringify({ email, password })}`);

    // Mock response
    return {
      user: 'mockUserId',
      token: 'mockToken123',
      error: undefined,
    };
  }
}
