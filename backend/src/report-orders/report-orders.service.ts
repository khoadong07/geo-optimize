import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { ReportsService } from '../reports/reports.service';
import { ReportOrder, ReportOrderDocument, ReportOrderStatus } from './report-order.schema';

const VAT_RATE = 0.1;
const ORDER_NUMBER_BASE = 2000;

@Injectable()
export class ReportOrdersService {
  constructor(
    @InjectModel(ReportOrder.name) private readonly reportOrderModel: Model<ReportOrderDocument>,
    private readonly reportsService: ReportsService,
    private readonly mailService: MailService,
  ) {}

  async create(params: { reportId: string; name?: string; email: string; company?: string; taxId?: string; discountCode?: string }) {
    const report = await this.reportsService.getPublicById(params.reportId);

    const subtotalVnd = report.priceVnd;
    const vatVnd = Math.round(subtotalVnd * VAT_RATE);
    const totalVnd = subtotalVnd + vatVnd;
    const orderNumber = ORDER_NUMBER_BASE + (await this.reportOrderModel.countDocuments());

    const created = new this.reportOrderModel({
      orderNumber,
      reportId: params.reportId,
      reportTitle: report.title,
      priceVnd: report.priceVnd,
      subtotalVnd,
      vatVnd,
      totalVnd,
      name: params.name || params.email.split('@')[0],
      email: params.email,
      company: params.company || '',
      taxId: params.taxId || '',
      discountCode: params.discountCode || '',
    });
    const saved = await created.save();

    if (report.priceVnd > 0) {
      await this.mailService.sendReportOrderReceivedEmail(params.email, saved.name, report.title, report.priceVnd);
    }

    return saved;
  }

  list() {
    return this.reportOrderModel.find().sort({ createdAt: -1 }).lean();
  }

  async getById(id: string) {
    const order = await this.reportOrderModel.findById(id).lean();
    if (!order) throw new NotFoundException('Report order not found');
    return order;
  }

  // Demo-only: there is no real payment gateway wired up. This simulates a
  // successful VietQR/MoMo/card payment so the checkout flow can be
  // demonstrated end-to-end; a real integration would replace this with a
  // webhook handler that verifies the actual transaction.
  async simulatePayment(id: string) {
    const order = await this.reportOrderModel.findById(id);
    if (!order) throw new NotFoundException('Report order not found');
    if (order.status === 'new') {
      order.status = 'paid';
      await order.save();
      await this.mailService.sendReportOrderPaidEmail(order.email, order.name, order.reportTitle, String(order._id));
    }
    return order;
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

  async getDownloadPath(id: string) {
    const order = await this.reportOrderModel.findById(id).lean();
    if (!order) throw new NotFoundException('Report order not found');
    if (order.status !== 'paid' && order.status !== 'fulfilled') {
      throw new ForbiddenException('This order has not been paid yet');
    }
    return this.reportsService.getDownloadPathForPaidOrder(order.reportId);
  }
}
