import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from './jwt-secret';

const ALLOWED_WHILE_MUST_CHANGE_PASSWORD = ['/auth/me', '/auth/change-password'];

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = decoded;

    if (decoded.mustChangePassword && !ALLOWED_WHILE_MUST_CHANGE_PASSWORD.includes(request.path)) {
      throw new ForbiddenException('You must change your password before continuing');
    }

    if (decoded.role === 'trial' && request.method !== 'GET') {
      throw new ForbiddenException('Trial access is read-only');
    }

    return true;
  }
}
