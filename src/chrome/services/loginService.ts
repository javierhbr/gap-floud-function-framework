import { Service } from 'typedi';
import {
  LoginResponse,
  OtpRequest,
  VerifyOtpRequest,
} from '../domain/genericDomain';

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

  async sendOtp(otpRequest: OtpRequest) {
    console.log(`LoginService.sendOtp: ${JSON.stringify(otpRequest)}`);

    // Mock response
    return Promise.resolve({ message: 'OTP sent successfully' });
  }

  async verifyOtp(verifyOtp: VerifyOtpRequest) {
    console.log(`LoginService.verifyOtp: ${JSON.stringify(verifyOtp)}`);

    // Mock response
    return Promise.resolve({ success: true });
  }
}
