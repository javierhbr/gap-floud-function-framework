import { Service } from 'typedi';
import {
  LoginResponse,
  OtpRequest,
  VerifyOtpRequest,
} from '../domain/genericDomain';
import { VerifyOtpResponse } from '../handlers/dto/login.dto';
import { JwtUtil } from './jwtUtil';

@Service()
export class LoginService {
  constructor(private readonly jwtUtil: JwtUtil) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    console.log(`LoginService.login: ${JSON.stringify({ email, password })}`);

    const payload = {
      email,
      type: 'access_token',
    };

    const token = await this.jwtUtil.generateToken(payload);

    // Mock response
    return {
      email: 'mockUserId',
      token,
      error: undefined,
    };
  }

  async sendOtp(otpRequest: OtpRequest): Promise<void> {
    console.log(`LoginService.sendOtp: ${JSON.stringify(otpRequest)}`);
  }

  async verifyOtp(verifyOtp: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    console.log(`LoginService.verifyOtp: ${JSON.stringify(verifyOtp)}`);
    const payload = {
      email: verifyOtp.email,
      type: 'access_token',
    };

    const token = await this.jwtUtil.generateToken(payload);
    return { email: verifyOtp.email, token };
  }
}
