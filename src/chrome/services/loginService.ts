import { Service } from 'typedi';
import {
  LoginResponse,
  OtpRequest,
  VerifyOtpRequest,
} from '../domain/genericDomain';
import { VerifyOtpResponse } from '../handlers/dto/login.dto';
import { JwtUtil } from '../utils/jwtUtil';
import { UserTokenPayload } from '../domain/user';

@Service()
export class LoginService {
  constructor(private readonly jwtUtil: JwtUtil) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    console.log(`LoginService.login: ${JSON.stringify({ email, password })}`);

    const payload: UserTokenPayload = {
      expiration: new Date('2023-12-31T23:59:59Z'),
      id: 'mockId123',
      verified: true,
      email: 'mockEmail@example.com',
      name: 'Mock Name',
      type: 'access_token',
    };

    const token = await this.jwtUtil.generateToken(payload);

    // Mock response
    return {
      email: 'mockUserId',
      token,
    };
  }

  async sendOtp(otpRequest: OtpRequest): Promise<void> {
    console.log(`LoginService.sendOtp: ${JSON.stringify(otpRequest)}`);
  }

  async verifyOtp(verifyOtp: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    console.log(`LoginService.verifyOtp: ${JSON.stringify(verifyOtp)}`);
    const payload: UserTokenPayload = {
      expiration: new Date('2023-12-31T23:59:59Z'),
      id: 'mockId123',
      verified: true,
      email: 'mockEmail@example.com',
      name: 'Mock Name',
      type: 'access_token',
    };

    const token = await this.jwtUtil.generateToken(payload);
    return { email: verifyOtp.email, token };
  }
}
