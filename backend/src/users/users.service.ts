import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

export type Role = 'admin' | 'user';

export const DEFAULT_PASSWORD = '123456';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  findById(id: string) {
    return this.userModel.findById(id);
  }

  count() {
    return this.userModel.countDocuments();
  }

  list() {
    return this.userModel.find().select('-passwordHash').lean();
  }

  async create(username: string, password: string, role: Role = 'user', mustChangePassword = false) {
    const existing = await this.findByUsername(username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await new this.userModel({ username, passwordHash, role, mustChangePassword }).save();
    return { id: created._id, username: created.username, role: created.role, mustChangePassword: created.mustChangePassword };
  }

  async setRole(id: string, role: Role) {
    const updated = await this.userModel.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash');
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.userModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('User not found');
    return { deleted: true };
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.findById(id);
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    if (newPassword === DEFAULT_PASSWORD) {
      throw new BadRequestException('New password cannot match the default password');
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();
    return user;
  }
}
