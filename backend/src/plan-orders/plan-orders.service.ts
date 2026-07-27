import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { PLAN_CONFIGS } from './plan-config';
import { PlanOrder, PlanOrderDocument, PlanOrderStatus } from './plan-order.schema';

const VAT_RATE = 0.1;
const ORDER_NUMBER_BASE = 3000;

@Injectable()
export class PlanOrdersService {
  constructor(
    @InjectModel(PlanOrder.name) private readonly planOrderModel: Model<PlanOrderDocument>,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  async create(params: { planSlug: string; name?: string; email: string; company?: string; discountCode?: string }) {
    const plan = PLAN_CONFIGS[params.planSlug];
    if (!plan) {
      throw new BadRequestException('Unknown or non-purchasable plan.');
    }

    const vatVnd = Math.round(plan.priceVnd * VAT_RATE);
    const totalVnd = plan.priceVnd + vatVnd;
    const orderNumber = ORDER_NUMBER_BASE + (await this.planOrderModel.countDocuments());

    const created = new this.planOrderModel({
      orderNumber,
      planSlug: params.planSlug,
      planName: plan.name,
      priceVnd: plan.priceVnd,
      vatVnd,
      totalVnd,
      name: params.name || params.email.split('@')[0],
      email: params.email,
      company: params.company || '',
      discountCode: params.discountCode || '',
    });
    return created.save();
  }

  list() {
    return this.planOrderModel.find().sort({ createdAt: -1 }).lean();
  }

  async getById(id: string) {
    const order = await this.planOrderModel.findById(id).lean();
    if (!order) throw new NotFoundException('Plan order not found');
    return order;
  }

  // Demo-only: no real payment gateway wired up. Simulates a successful
  // VietQR/MoMo/card payment, same as ReportOrdersService.simulatePayment —
  // a real integration would replace this with a webhook handler. Once paid,
  // immediately email the buyer their magic-link login so they don't have to
  // wait on anyone to provision an account.
  async simulatePayment(id: string) {
    const order = await this.planOrderModel.findById(id);
    if (!order) throw new NotFoundException('Plan order not found');
    if (order.status === 'new') {
      order.status = 'paid';
      await order.save();
      await this.sendLoginLink(order.email, order.name, order.planSlug).catch(() => {});
    }
    return order;
  }

  // Public entry point for a buyer to (re)request their login link at any
  // time, e.g. if they lost the original email — not just right after
  // paying. Always issues a fresh token off their most recent paid plan.
  async requestLogin(email: string) {
    const latestPaid = await this.planOrderModel
      .findOne({ email, status: { $in: ['paid', 'fulfilled'] } })
      .sort({ createdAt: -1 });
    if (!latestPaid) {
      throw new NotFoundException('No paid plan found for this email.');
    }
    await this.sendLoginLink(latestPaid.email, latestPaid.name, latestPaid.planSlug);
    return { sent: true };
  }

  private async sendLoginLink(email: string, name: string, planSlug: string) {
    const plan = PLAN_CONFIGS[planSlug];
    if (!plan) return; // plan was removed/renamed since purchase — nothing sane to issue

    const { token } = this.authService.issueCustomerToken(email, name, plan);
    const appUrl = process.env.APP_URL || 'http://localhost:3002';
    const loginUrl = `${appUrl}/customer-login?token=${token}`;
    await this.mailService.sendCustomerLoginEmail(email, name, loginUrl);
  }

  async setStatus(id: string, status: PlanOrderStatus) {
    const updated = await this.planOrderModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) throw new NotFoundException('Plan order not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.planOrderModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Plan order not found');
    return { deleted: true };
  }
}
