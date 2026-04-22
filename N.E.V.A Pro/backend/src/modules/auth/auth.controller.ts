import {
  Body,
  ConflictException,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() body: any) {
    const existingUser = await this.userService.findByEmail(body.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userService.create({
      name: body.name,
      email: body.email,
      password_hash: body.password,
    });

    return this.authService.login(user);
  }

  @Post('google')
  @ApiOperation({ summary: 'Log in with Google' })
  async googleLogin(@Body() body: any) {
    if (!body?.credential) {
      throw new UnauthorizedException('Missing Google credential');
    }

    return this.authService.loginWithGoogle(body.credential);
  }

  @Post('apple')
  @ApiOperation({ summary: 'Log in with Apple' })
  async appleLogin(@Body() body: any) {
    if (!body?.identityToken) {
      throw new UnauthorizedException('Missing Apple identity token');
    }

    return this.authService.loginWithApple(body.identityToken, body.user);
  }
}
