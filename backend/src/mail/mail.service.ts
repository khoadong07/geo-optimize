import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { reportOrderPaidEmailHtml } from './templates/report-order-paid.template';
import { reportOrderReceivedEmailHtml } from './templates/report-order-received.template';
import { trialPreviewEmailHtml } from './templates/trial-preview.template';

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

  private async send(to: string, subject: string, html: string, devLogSummary: string) {
    if (!this.transporter) {
      this.logger.log(`[dev mode, no SMTP configured] Would send "${subject}" to ${to}: ${devLogSummary}`);
      return { sent: false };
    }
    try {
      await this.transporter.sendMail({ from: this.fromAddress, to, subject, html });
      return { sent: true };
    } catch (err) {
      this.logger.error(`Failed to send "${subject}" to ${to}`, err as Error);
      return { sent: false };
    }
  }

  async sendTrialPreviewEmail(to: string, name: string, previewUrl: string) {
    const html = trialPreviewEmailHtml({ name, previewUrl, year: new Date().getFullYear() });
    return this.send(to, 'Your GeoBase trial preview is ready', html, `previewUrl=${previewUrl}`);
  }

  async sendReportOrderReceivedEmail(to: string, name: string, reportTitle: string, priceVnd: number) {
    const html = reportOrderReceivedEmailHtml({ name, reportTitle, priceVnd, year: new Date().getFullYear() });
    return this.send(to, `Your request for "${reportTitle}"`, html, `report=${reportTitle} price=${priceVnd}`);
  }

  async sendReportOrderPaidEmail(to: string, name: string, reportTitle: string, orderId: string) {
    const appUrl = process.env.APP_URL || 'http://localhost:3002';
    const downloadUrl = `${appUrl}/api/report-orders/${orderId}/download`;
    const html = reportOrderPaidEmailHtml({ name, reportTitle, downloadUrl, year: new Date().getFullYear() });
    return this.send(to, `Your report is ready: "${reportTitle}"`, html, `report=${reportTitle}`);
  }
}
