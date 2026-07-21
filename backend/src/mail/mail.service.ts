import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { trialWelcomeEmailHtml } from './templates/trial-welcome.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter = this.buildTransporter();

  private buildTransporter() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!user || !pass) {
      this.logger.warn('SMTP_USER/SMTP_PASS not set — emails will be logged instead of sent.');
      return null;
    }
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
      secure: true,
      auth: { user, pass },
    });
  }

  private get fromAddress() {
    return process.env.MAIL_FROM || `GeoBase <${process.env.SMTP_USER}>`;
  }

  async sendTrialWelcomeEmail(to: string, username: string, password: string) {
    const appUrl = process.env.APP_URL || 'http://localhost:3002';
    const subject = 'Your GeoBase trial account is ready';
    const html = trialWelcomeEmailHtml({ username, password, appUrl, year: new Date().getFullYear() });

    if (!this.transporter) {
      this.logger.log(`[dev mode, no SMTP configured] Would send welcome email to ${to}: username=${username} password=${password}`);
      return { sent: false };
    }

    try {
      await this.transporter.sendMail({ from: this.fromAddress, to, subject, html });
      return { sent: true };
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}`, err as Error);
      return { sent: false };
    }
  }
}
