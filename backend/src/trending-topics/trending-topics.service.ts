import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AUTOMOTIVE_MONTHLY,
  AUTOMOTIVE_MONTHLY_EN,
  AUTOMOTIVE_WEEKLY,
  AUTOMOTIVE_WEEKLY_EN,
  BANKING_MONTHLY,
  BANKING_MONTHLY_EN,
  BANKING_WEEKLY,
  BANKING_WEEKLY_EN,
  BEAUTY_MONTHLY,
  BEAUTY_MONTHLY_EN,
  BEAUTY_WEEKLY,
  BEAUTY_WEEKLY_EN,
  ECOMMERCE_MONTHLY,
  ECOMMERCE_MONTHLY_EN,
  ECOMMERCE_WEEKLY,
  ECOMMERCE_WEEKLY_EN,
  EDUCATION_MONTHLY,
  EDUCATION_MONTHLY_EN,
  EDUCATION_WEEKLY,
  EDUCATION_WEEKLY_EN,
  FASHION_MONTHLY,
  FASHION_MONTHLY_EN,
  FASHION_WEEKLY,
  FASHION_WEEKLY_EN,
  FMCG_MONTHLY,
  FMCG_MONTHLY_EN,
  FMCG_WEEKLY,
  FMCG_WEEKLY_EN,
  FNB_MONTHLY,
  FNB_MONTHLY_EN,
  FNB_WEEKLY,
  FNB_WEEKLY_EN,
  getTrending,
  HEALTHCARE_MONTHLY,
  HEALTHCARE_MONTHLY_EN,
  HEALTHCARE_WEEKLY,
  HEALTHCARE_WEEKLY_EN,
  INSURANCE_MONTHLY,
  INSURANCE_MONTHLY_EN,
  INSURANCE_WEEKLY,
  INSURANCE_WEEKLY_EN,
  LOGISTICS_MONTHLY,
  LOGISTICS_MONTHLY_EN,
  LOGISTICS_WEEKLY,
  LOGISTICS_WEEKLY_EN,
  REAL_ESTATE_MONTHLY,
  REAL_ESTATE_MONTHLY_EN,
  REAL_ESTATE_WEEKLY,
  REAL_ESTATE_WEEKLY_EN,
  TECHNOLOGY_MONTHLY,
  TECHNOLOGY_MONTHLY_EN,
  TECHNOLOGY_WEEKLY,
  TECHNOLOGY_WEEKLY_EN,
  TELECOM_MONTHLY,
  TELECOM_MONTHLY_EN,
  TELECOM_WEEKLY,
  TELECOM_WEEKLY_EN,
  TRAVEL_MONTHLY,
  TRAVEL_MONTHLY_EN,
  TRAVEL_WEEKLY,
  TRAVEL_WEEKLY_EN,
  TrendingLang,
  TrendingPeriod,
} from '../trending/trending-data';
import { TrendingTopic, TrendingTopicDocument } from './trending-topic.schema';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class TrendingTopicsService implements OnModuleInit {
  private readonly logger = new Logger(TrendingTopicsService.name);

  constructor(@InjectModel(TrendingTopic.name) private readonly model: Model<TrendingTopicDocument>) {}

  async onModuleInit() {
    // Backfill: topics created before `lang` existed on the schema have no
    // `lang` stored at all, not just a falsy one — `.lean()` reads skip
    // Mongoose's schema default, and a missing field also fails to match an
    // equality filter like `{ lang: 'vi' }` in getEffective(), so without
    // this those old topics both crash lang-aware UI and silently stop
    // showing up. Runs every boot; a no-op once nothing is missing `lang`.
    await this.model.updateMany({ lang: { $exists: false } }, { $set: { lang: 'vi' } });

    const seedSet: Array<{ industry: string; lang: TrendingLang; weekly: string[]; monthly: string[] }> = [
      { industry: 'Banking', lang: 'vi', weekly: BANKING_WEEKLY, monthly: BANKING_MONTHLY },
      { industry: 'Banking', lang: 'en', weekly: BANKING_WEEKLY_EN, monthly: BANKING_MONTHLY_EN },
      { industry: 'FMCG', lang: 'vi', weekly: FMCG_WEEKLY, monthly: FMCG_MONTHLY },
      { industry: 'FMCG', lang: 'en', weekly: FMCG_WEEKLY_EN, monthly: FMCG_MONTHLY_EN },
      { industry: 'Insurance', lang: 'vi', weekly: INSURANCE_WEEKLY, monthly: INSURANCE_MONTHLY },
      { industry: 'Insurance', lang: 'en', weekly: INSURANCE_WEEKLY_EN, monthly: INSURANCE_MONTHLY_EN },
      { industry: 'Telecom', lang: 'vi', weekly: TELECOM_WEEKLY, monthly: TELECOM_MONTHLY },
      { industry: 'Telecom', lang: 'en', weekly: TELECOM_WEEKLY_EN, monthly: TELECOM_MONTHLY_EN },
      { industry: 'Real Estate', lang: 'vi', weekly: REAL_ESTATE_WEEKLY, monthly: REAL_ESTATE_MONTHLY },
      { industry: 'Real Estate', lang: 'en', weekly: REAL_ESTATE_WEEKLY_EN, monthly: REAL_ESTATE_MONTHLY_EN },
      { industry: 'E-commerce', lang: 'vi', weekly: ECOMMERCE_WEEKLY, monthly: ECOMMERCE_MONTHLY },
      { industry: 'E-commerce', lang: 'en', weekly: ECOMMERCE_WEEKLY_EN, monthly: ECOMMERCE_MONTHLY_EN },
      { industry: 'Education', lang: 'vi', weekly: EDUCATION_WEEKLY, monthly: EDUCATION_MONTHLY },
      { industry: 'Education', lang: 'en', weekly: EDUCATION_WEEKLY_EN, monthly: EDUCATION_MONTHLY_EN },
      { industry: 'Healthcare', lang: 'vi', weekly: HEALTHCARE_WEEKLY, monthly: HEALTHCARE_MONTHLY },
      { industry: 'Healthcare', lang: 'en', weekly: HEALTHCARE_WEEKLY_EN, monthly: HEALTHCARE_MONTHLY_EN },
      { industry: 'Automotive', lang: 'vi', weekly: AUTOMOTIVE_WEEKLY, monthly: AUTOMOTIVE_MONTHLY },
      { industry: 'Automotive', lang: 'en', weekly: AUTOMOTIVE_WEEKLY_EN, monthly: AUTOMOTIVE_MONTHLY_EN },
      { industry: 'Travel & Hospitality', lang: 'vi', weekly: TRAVEL_WEEKLY, monthly: TRAVEL_MONTHLY },
      { industry: 'Travel & Hospitality', lang: 'en', weekly: TRAVEL_WEEKLY_EN, monthly: TRAVEL_MONTHLY_EN },
      { industry: 'F&B', lang: 'vi', weekly: FNB_WEEKLY, monthly: FNB_MONTHLY },
      { industry: 'F&B', lang: 'en', weekly: FNB_WEEKLY_EN, monthly: FNB_MONTHLY_EN },
      { industry: 'Technology', lang: 'vi', weekly: TECHNOLOGY_WEEKLY, monthly: TECHNOLOGY_MONTHLY },
      { industry: 'Technology', lang: 'en', weekly: TECHNOLOGY_WEEKLY_EN, monthly: TECHNOLOGY_MONTHLY_EN },
      { industry: 'Logistics', lang: 'vi', weekly: LOGISTICS_WEEKLY, monthly: LOGISTICS_MONTHLY },
      { industry: 'Logistics', lang: 'en', weekly: LOGISTICS_WEEKLY_EN, monthly: LOGISTICS_MONTHLY_EN },
      { industry: 'Beauty & Cosmetics', lang: 'vi', weekly: BEAUTY_WEEKLY, monthly: BEAUTY_MONTHLY },
      { industry: 'Beauty & Cosmetics', lang: 'en', weekly: BEAUTY_WEEKLY_EN, monthly: BEAUTY_MONTHLY_EN },
      { industry: 'Fashion & Retail', lang: 'vi', weekly: FASHION_WEEKLY, monthly: FASHION_MONTHLY },
      { industry: 'Fashion & Retail', lang: 'en', weekly: FASHION_WEEKLY_EN, monthly: FASHION_MONTHLY_EN },
    ];

    // Per-(industry, period, lang) backfill rather than "seed only if the
    // whole collection is empty" — a DB that already had the original
    // single-language 5-industry data (from before this bilingual/15-industry
    // set existed) would otherwise never receive the missing combinations
    // (the 10 new industries, and the EN half of the original 5). Runs every
    // boot; only inserts whatever combination has zero docs, so it's a
    // no-op once everything below has been backfilled once.
    let insertedCount = 0;
    for (const { industry, lang, weekly, monthly } of seedSet) {
      const [weekExists, monthExists] = await Promise.all([
        this.model.exists({ industry, period: 'week', lang }),
        this.model.exists({ industry, period: 'month', lang }),
      ]);
      const docs = [
        ...(!weekExists ? weekly.map((text) => ({ industry, period: 'week' as const, lang, text })) : []),
        ...(!monthExists ? monthly.map((text) => ({ industry, period: 'month' as const, lang, text })) : []),
      ];
      if (docs.length) {
        await this.model.insertMany(docs);
        insertedCount += docs.length;
      }
    }
    if (insertedCount) {
      this.logger.log(`Backfilled ${insertedCount} trending topics into MongoDB`);
    }
  }

  list(industry?: string, period?: TrendingPeriod, lang?: TrendingLang) {
    const filter: Record<string, unknown> = {};
    if (industry) filter.industry = new RegExp(`^${escapeRegex(industry.trim())}$`, 'i');
    if (period) filter.period = period;
    if (lang) filter.lang = lang;
    return this.model.find(filter).sort({ industry: 1, period: 1, lang: 1, createdAt: 1 }).lean();
  }

  listIndustries() {
    return this.model.distinct('industry');
  }

  create(data: { industry: string; period: TrendingPeriod; lang?: TrendingLang; text: string }) {
    const created = new this.model({
      industry: data.industry.trim(),
      period: data.period,
      lang: data.lang || 'vi',
      text: data.text.trim(),
    });
    return created.save();
  }

  createMany(data: { industry: string; period: TrendingPeriod; lang?: TrendingLang; texts: string[] }) {
    const docs = data.texts
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => ({ industry: data.industry.trim(), period: data.period, lang: data.lang || 'vi', text }));
    if (!docs.length) return Promise.resolve([]);
    return this.model.insertMany(docs);
  }

  async update(id: string, data: { industry?: string; period?: TrendingPeriod; lang?: TrendingLang; text?: string }) {
    const topic = await this.model.findById(id);
    if (!topic) throw new NotFoundException('Trending topic not found');
    if (data.industry !== undefined) topic.industry = data.industry.trim();
    if (data.period !== undefined) topic.period = data.period;
    if (data.lang !== undefined) topic.lang = data.lang;
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
  async getEffective(industry: string, period: TrendingPeriod, lang: TrendingLang = 'vi'): Promise<string[]> {
    const configured = await this.model
      .find({ industry: new RegExp(`^${escapeRegex(industry.trim())}$`, 'i'), period, lang })
      .sort({ createdAt: 1 })
      .lean();
    if (configured.length) return configured.map((c) => c.text);
    return getTrending(industry, period, lang);
  }
}
