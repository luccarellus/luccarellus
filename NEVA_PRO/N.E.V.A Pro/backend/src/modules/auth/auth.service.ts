import { Injectable } from '@nestjs/common';
import { UserService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && user.password_hash === pass) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }
}
