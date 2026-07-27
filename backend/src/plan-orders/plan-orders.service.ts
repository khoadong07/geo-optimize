import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlanOrder, PlanOrderDocument, PlanOrderStatus } from './plan-order.schema';

const VAT_RATE = 0.1;
const ORDER_NUMBER_BASE = 3000;

// Mirrors the purchasable plans in frontend/app/i18n.tsx's `pricing.plans` —
// kept in sync manually since plans aren't a backend-managed collection
// (unlike Reports). Enterprise is intentionally excluded: it's "contact
// sales" only, no direct checkout.
const PLAN_PRICING: Record<string, { name: string; priceVnd: number }> = {
  'starter-vn': { name: 'Starter VN', priceVnd: 2_500_000 },
  'growth-vn': { name: 'Growth VN', priceVnd: 7_500_000 },
};

@Injectable()
export class PlanOrdersService {
  constructor(@InjectModel(PlanOrder.name) private readonly planOrderModel: Model<PlanOrderDocument>) {}

  async create(params: { planSlug: string; name?: string; email: string; company?: string; discountCode?: string }) {
    const plan = PLAN_PRICING[params.planSlug];
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
  // a real integration would replace this with a webhook handler.
  async simulatePayment(id: string) {
    const order = await this.planOrderModel.findById(id);
    if (!order) throw new NotFoundException('Plan order not found');
    if (order.status === 'new') {
      order.status = 'paid';
      await order.save();
    }
    return order;
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
