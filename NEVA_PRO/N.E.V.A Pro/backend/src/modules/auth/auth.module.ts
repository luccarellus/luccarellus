import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../users/users.module';

@Module({
  imports: [UserModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
