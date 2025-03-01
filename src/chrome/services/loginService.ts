import { Service } from 'typedi';
import {
  LoginResponse,
  OtpRequest,
  VerifyOtpRequest,
} from '../domain/genericDomain';
import { VerifyOtpResponse } from '../handlers/dto/login.dto';

@Service()
export class LoginService {
  constructor() {}

  async login(email: string, password: string): Promise<LoginResponse> {
    console.log(`LoginService.login: ${JSON.stringify({ email, password })}`);

    // Mock response
    return {
      email: 'mockUserId',
      token: 'mockToken123',
      error: undefined,
    };
  }

  async sendOtp(otpRequest: OtpRequest): Promise<void> {
    console.log(`LoginService.sendOtp: ${JSON.stringify(otpRequest)}`);
  }

  async verifyOtp(verifyOtp: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    console.log(`LoginService.verifyOtp: ${JSON.stringify(verifyOtp)}`);

    // Mock response
    return { email: verifyOtp.email, token: 'token' };
  }
}
