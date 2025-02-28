import { Service } from 'typedi';
import { LoginService } from '../../services/loginService';
import {
  LoginRequest,
  LoginResponse,
  SentOtpRequest,
  VerifyOtpRequest,
} from '../dto/login.dto';

@Service()
export class LoginApi {
  constructor(private loginService: LoginService) {}

  async login(body: LoginRequest): Promise<LoginResponse> {
    console.log(`LoginApi.login: ${JSON.stringify(body)}`);
    return await this.loginService.login(body.email, body.password);
  }

  async sendOtp(parsedBody: SentOtpRequest) {
    console.log(`LoginApi.sendOtp: ${JSON.stringify(parsedBody)}`);
    return await this.loginService.sendOtp(parsedBody);
  }

  async verifyOtp(parsedBody: VerifyOtpRequest) {
    console.log(`LoginApi.verifyOtp: ${JSON.stringify(parsedBody)}`);
    return await this.loginService.verifyOtp(parsedBody);
  }
}
