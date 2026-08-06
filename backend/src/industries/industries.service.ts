import { ConflictException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Industry, IndustryDocument } from './industry.schema';

// The industry catalog used to be a hardcoded array duplicated in both apps
// (frontend/app/industry.ts and backend/src/trial/industry-detect.util.ts).
// This seeds that same starting set into Mongo on first boot so admins have
// something to edit right away; from then on Mongo is the source of truth.
const SEED: Array<{ name: string; labelEn: string; labelVi: string }> = [
  { name: 'Banking', labelEn: 'Banking', labelVi: 'Ngân hàng' },
  { name: 'FMCG', labelEn: 'FMCG', labelVi: 'FMCG' },
  { name: 'Insurance', labelEn: 'Insurance', labelVi: 'Bảo hiểm' },
  { name: 'Telecom', labelEn: 'Telecom', labelVi: 'Viễn thông' },
  { name: 'Real Estate', labelEn: 'Real Estate', labelVi: 'Bất động sản' },
  { name: 'E-commerce', labelEn: 'E-commerce', labelVi: 'Thương mại điện tử' },
  { name: 'Education', labelEn: 'Education', labelVi: 'Giáo dục' },
  { name: 'Healthcare', labelEn: 'Healthcare', labelVi: 'Y tế' },
  { name: 'Automotive', labelEn: 'Automotive', labelVi: 'Ô tô - Xe máy' },
  { name: 'Travel & Hospitality', labelEn: 'Travel & Hospitality', labelVi: 'Du lịch & Khách sạn' },
  { name: 'F&B', labelEn: 'F&B', labelVi: 'Ẩm thực & Nhà hàng' },
  { name: 'Technology', labelEn: 'Technology', labelVi: 'Công nghệ' },
  { name: 'Logistics', labelEn: 'Logistics', labelVi: 'Vận chuyển & Logistics' },
  { name: 'Beauty & Cosmetics', labelEn: 'Beauty & Cosmetics', labelVi: 'Làm đẹp & Mỹ phẩm' },
  { name: 'Fashion & Retail', labelEn: 'Fashion & Retail', labelVi: 'Thời trang & Bán lẻ' },
];

@Injectable()
export class IndustriesService implements OnModuleInit {
  private readonly logger = new Logger(IndustriesService.name);

  constructor(@InjectModel(Industry.name) private readonly model: Model<IndustryDocument>) {}

  async onModuleInit() {
    const existingCount = await this.model.estimatedDocumentCount();
    if (existingCount > 0) return;

    await this.model.insertMany(SEED.map((s, i) => ({ ...s, order: i })));
    this.logger.log(`Seeded ${SEED.length} initial industries into MongoDB`);
  }

  list() {
    return this.model.find().sort({ order: 1, labelEn: 1 }).lean();
  }

  // Plain canonical names, for classification prompts and validation — the
  // "Other" bucket is a fixed sentinel, not admin-editable, since it's the
  // fallback when nothing else matches rather than a real industry.
  async listNames(): Promise<string[]> {
    const industries = await this.model.find().sort({ order: 1 }).select('name').lean();
    return [...industries.map((i) => i.name), 'Other'];
  }

  async create(data: { name: string; labelEn: string; labelVi: string; order?: number }) {
    const existing = await this.model.findOne({ name: data.name.trim() });
    if (existing) throw new ConflictException('An industry with this name already exists');
    const count = await this.model.estimatedDocumentCount();
    const created = new this.model({
      name: data.name.trim(),
      labelEn: data.labelEn.trim(),
      labelVi: data.labelVi.trim(),
      order: data.order ?? count,
    });
    return created.save();
  }

  async update(id: string, data: { name?: string; labelEn?: string; labelVi?: string; order?: number }) {
    const industry = await this.model.findById(id);
    if (!industry) throw new NotFoundException('Industry not found');
    if (data.name !== undefined) industry.name = data.name.trim();
    if (data.labelEn !== undefined) industry.labelEn = data.labelEn.trim();
    if (data.labelVi !== undefined) industry.labelVi = data.labelVi.trim();
    if (data.order !== undefined) industry.order = data.order;
    return industry.save();
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Industry not found');
    return { deleted: true };
  }
}
