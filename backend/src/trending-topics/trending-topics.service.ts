import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BANKING_MONTHLY, BANKING_WEEKLY, getTrending, TrendingPeriod } from '../trending/trending-data';
import { TrendingTopic, TrendingTopicDocument } from './trending-topic.schema';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class TrendingTopicsService implements OnModuleInit {
  private readonly logger = new Logger(TrendingTopicsService.name);

  constructor(@InjectModel(TrendingTopic.name) private readonly model: Model<TrendingTopicDocument>) {}

  // First boot only: seeds the built-in Banking questions so admins have
  // something to edit right away instead of an empty table. No-ops once any
  // trending topic already exists in Mongo.
  async onModuleInit() {
    const existingCount = await this.model.estimatedDocumentCount();
    if (existingCount > 0) return;

    await this.model.insertMany([
      ...BANKING_WEEKLY.map((text) => ({ industry: 'Banking', period: 'week' as const, text })),
      ...BANKING_MONTHLY.map((text) => ({ industry: 'Banking', period: 'month' as const, text })),
    ]);
    this.logger.log('Seeded initial Banking trending topics into MongoDB');
  }

  list(industry?: string, period?: TrendingPeriod) {
    const filter: Record<string, unknown> = {};
    if (industry) filter.industry = new RegExp(`^${escapeRegex(industry.trim())}$`, 'i');
    if (period) filter.period = period;
    return this.model.find(filter).sort({ industry: 1, period: 1, createdAt: 1 }).lean();
  }

  listIndustries() {
    return this.model.distinct('industry');
  }

  create(data: { industry: string; period: TrendingPeriod; text: string }) {
    const created = new this.model({ industry: data.industry.trim(), period: data.period, text: data.text.trim() });
    return created.save();
  }

  createMany(data: { industry: string; period: TrendingPeriod; texts: string[] }) {
    const docs = data.texts.map((text) => text.trim()).filter(Boolean).map((text) => ({ industry: data.industry.trim(), period: data.period, text }));
    if (!docs.length) return Promise.resolve([]);
    return this.model.insertMany(docs);
  }

  async update(id: string, data: { industry?: string; period?: TrendingPeriod; text?: string }) {
    const topic = await this.model.findById(id);
    if (!topic) throw new NotFoundException('Trending topic not found');
    if (data.industry !== undefined) topic.industry = data.industry.trim();
    if (data.period !== undefined) topic.period = data.period;
    if (data.text !== undefined) topic.text = data.text.trim();
    return topic.save();
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Trending topic not found');
    return { deleted: true };
  }

  // Used by the public /trending endpoint: admin-configured topics win when
  // present; falls back to the built-in generic template for industries no
  // admin has configured yet.
  async getEffective(industry: string, period: TrendingPeriod): Promise<string[]> {
    const configured = await this.model
      .find({ industry: new RegExp(`^${escapeRegex(industry.trim())}$`, 'i'), period })
      .sort({ createdAt: 1 })
      .lean();
    if (configured.length) return configured.map((c) => c.text);
    return getTrending(industry, period);
  }
}
