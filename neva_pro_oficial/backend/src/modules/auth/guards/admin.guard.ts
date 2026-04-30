import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { isAdminByEmail } from '../../../core/admin-access';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !isAdminByEmail(user.email)) {
      throw new ForbiddenException('Acesso restrito a administradores');
    }

    return true;
  }
}
