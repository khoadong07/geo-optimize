import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  sub: string;
  username: string;
  role: 'admin' | 'user' | 'trial' | 'customer';
  // Only present for role 'customer' — plan entitlements baked into the
  // magic-link token at issue time (no User document backs this identity).
  planSlug?: string;
  maxProjects?: number;
  allowedPlatforms?: Array<'GEMINI' | 'OPENAI'>;
  maxRunsPerPrompt?: number;
}

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
