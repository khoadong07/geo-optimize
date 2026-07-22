import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { ReportsService } from '../reports/reports.service';
import { ReportOrder, ReportOrderDocument, ReportOrderStatus } from './report-order.schema';

@Injectable()
export class ReportOrdersService {
  constructor(
    @InjectModel(ReportOrder.name) private readonly reportOrderModel: Model<ReportOrderDocument>,
    private readonly reportsService: ReportsService,
    private readonly mailService: MailService,
  ) {}

  async create(reportId: string, name: string, email: string, company: string | undefined) {
    const report = await this.reportsService.getPublicById(reportId);

    const created = new this.reportOrderModel({
      reportId,
      reportTitle: report.title,
      priceVnd: report.priceVnd,
      name,
      email,
      company: company || '',
    });
    const saved = await created.save();

    await this.mailService.sendReportOrderReceivedEmail(email, name, report.title, report.priceVnd);

    return saved;
  }

  list() {
    return this.reportOrderModel.find().sort({ createdAt: -1 }).lean();
  }

  async setStatus(id: string, status: ReportOrderStatus) {
    const updated = await this.reportOrderModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) throw new NotFoundException('Report order not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.reportOrderModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Report order not found');
    return { deleted: true };
  }
}
