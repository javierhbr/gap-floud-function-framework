import { Service } from 'typedi';
import { LoginService } from '../../services/loginService';
import { LoginRequest, LoginResponse } from '../dto/login.dto';

@Service()
export class LoginApi {
  constructor(private loginService: LoginService) {}

  async login(body: LoginRequest): Promise<LoginResponse> {
    console.log(`LoginApi.login: ${JSON.stringify(body)}`);
    return await this.loginService.login(body.email, body.password);
  }
}
