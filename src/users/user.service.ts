import { Inject, Service } from 'typedi';
import { UserQueryParams } from './http.types';
import { HttpError } from '../core/errors';
import { logger } from '../utils/logger';

@Service()
export class UserService {
  private usersList: Map<string, any> = new Map<string, any>();
  constructor(
    @Inject('businessData')
    private businessData: Map<string, any>
  ) {}

  async listUsers(queryParams: UserQueryParams): Promise<any[]> {
    const users = Array.from(this.usersList.values()).filter((user) => {
      if (queryParams.age && user.age !== queryParams.age) return false;
      if (queryParams.active !== undefined && user.active !== queryParams.active) return false;
      return true;
    });
    return users;
  }

  async createUser(userData: any): Promise<any> {
    const userId = Math.random().toString(36).substr(2, 9);
    const user = { ...userData, id: userId };
    logger.info(`Creating user user_${userId}`);
    this.usersList.set(`user_${userId}`, user);
    logger.info(`checking user ${JSON.stringify(this.usersList.get(`user_${userId}`))}`);
    return user;
  }

  async getUser(userId: string): Promise<any> {
    logger.info('Getting user', { userId });
    const user = this.usersList.get(`user_${userId}`);
    logger.info(`getting user ${JSON.stringify(user)}`);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }
    return user;
  }
}
