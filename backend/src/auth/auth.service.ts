import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { getJwtSecret } from './jwt-secret';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly usersService: UsersService) {}

  // First boot only: seeds the admin account from env vars so there's a way
  // to log in before any other user exists. No-ops once a user already
  // exists in Mongo.
  async onModuleInit() {
    const existingCount = await this.usersService.count();
    if (existingCount > 0) return;

    const username = process.env.AUTH_USERNAME;
    const password = process.env.AUTH_PASSWORD;
    if (!username || !password) {
      throw new Error('AUTH_USERNAME and AUTH_PASSWORD environment variables are required to seed the initial user');
    }

    await this.usersService.create(username, password, 'admin');
    this.logger.log(`Seeded initial admin user "${username}" into MongoDB`);
  }

  private issueToken(user: { _id: any; username: string; role: 'admin' | 'user'; mustChangePassword: boolean }) {
    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username, role: user.role, mustChangePassword: user.mustChangePassword },
      getJwtSecret(),
      { expiresIn: '8h' },
    );
    return { token, user: { id: user._id, username: user.username, role: user.role, mustChangePassword: user.mustChangePassword } };
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueToken(user);
  }

  // No User document is created for a trial — the token is a self-contained,
  // read-only credential scoped to the lead's trial-request id. Expiry is long
  // enough to cover both the instant in-browser redirect and someone opening
  // the emailed preview link later the same day.
  issueTrialToken(trialRequestId: string, name: string) {
    const token = jwt.sign(
      { sub: trialRequestId, username: name, role: 'trial', mustChangePassword: false },
      getJwtSecret(),
      { expiresIn: '24h' },
    );
    return { token };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.changePassword(userId, currentPassword, newPassword);
    return this.issueToken(user);
  }
}
