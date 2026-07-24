import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { TrialRequest, TrialRequestDocument, TrialRequestStatus } from './trial-request.schema';

@Injectable()
export class TrialRequestsService {
  constructor(
    @InjectModel(TrialRequest.name) private readonly trialRequestModel: Model<TrialRequestDocument>,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  async create(name: string, email: string, company: string, message?: string) {
    const created = await new this.trialRequestModel({ name, email, company, message: message || '' }).save();
    const { token } = this.authService.issueTrialToken(created._id.toString(), name);

    const appUrl = process.env.APP_URL || 'http://localhost:3002';
    const previewUrl = `${appUrl}/trial?token=${token}`;
    const { sent } = await this.mailService.sendTrialPreviewEmail(email, name, previewUrl);
    created.previewEmailSent = sent;
    await created.save();

    return { trialRequest: created, token };
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
