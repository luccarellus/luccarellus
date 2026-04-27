import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private sanitizeUser(user: any) {
    if (!user) return user;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const normalizedEmail = String(email || '').toLowerCase().trim();

    const user = await this.userService.findByEmail(normalizedEmail);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      return this.sanitizeUser(user);
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        ...this.sanitizeUser(user),
        is_admin: Boolean(user?.is_admin),
      },
    };
  }
}
