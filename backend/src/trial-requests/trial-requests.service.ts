import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { generateRandomPassword, UsersService } from '../users/users.service';
import { TrialRequest, TrialRequestDocument, TrialRequestStatus } from './trial-request.schema';

@Injectable()
export class TrialRequestsService {
  constructor(
    @InjectModel(TrialRequest.name) private readonly trialRequestModel: Model<TrialRequestDocument>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  private async generateUsername(email: string) {
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
    let candidate = base;
    let suffix = 1;
    while (await this.usersService.findByUsername(candidate)) {
      candidate = `${base}${++suffix}`;
    }
    return candidate;
  }

  async create(name: string, email: string, company: string, message?: string) {
    const username = await this.generateUsername(email);
    const password = generateRandomPassword();
    await this.usersService.create(username, password, 'user', true);
    const { sent } = await this.mailService.sendTrialWelcomeEmail(email, username, password);

    const created = new this.trialRequestModel({
      name,
      email,
      company,
      message: message || '',
      accountUsername: username,
      welcomeEmailSent: sent,
    });
    return created.save();
  }

  list() {
    return this.trialRequestModel.find().sort({ createdAt: -1 }).lean();
  }

  async setStatus(id: string, status: TrialRequestStatus) {
    const updated = await this.trialRequestModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) throw new NotFoundException('Trial request not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.trialRequestModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Trial request not found');
    return { deleted: true };
  }
}
