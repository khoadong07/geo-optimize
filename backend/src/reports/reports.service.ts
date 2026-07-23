import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { Model } from 'mongoose';
import { extname, join } from 'path';
import { Report, ReportCategory, ReportDocument, ReportStatus } from './report.schema';
import { COVERS_DIR, ensureUploadDirs, FILES_DIR } from './storage.util';

type ReportFiles = { cover?: Express.Multer.File[]; file?: Express.Multer.File[] };

type ReportInput = {
  title: string;
  subtitle?: string;
  description?: string;
  category: ReportCategory;
  priceVnd: number;
  status: ReportStatus;
};

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>) {
    ensureUploadDirs();
  }

  listPublic() {
    return this.reportModel
      .find({ status: { $in: ['published', 'coming_soon'] } })
      .sort({ createdAt: -1 })
      .lean();
  }

  listAll() {
    return this.reportModel.find().sort({ createdAt: -1 }).lean();
  }

  async getPublicById(id: string) {
    const report = await this.reportModel.findOne({ _id: id, status: { $in: ['published', 'coming_soon'] } }).lean();
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  private saveToDisk(dir: string, file: Express.Multer.File) {
    const filename = `${randomUUID()}${extname(file.originalname)}`;
    writeFileSync(join(dir, filename), file.buffer);
    return filename;
  }

  private deleteFromDisk(dir: string, filename?: string) {
    if (!filename) return;
    const full = join(dir, filename);
    if (existsSync(full)) unlinkSync(full);
  }

  async create(data: ReportInput, files: ReportFiles) {
    const coverFile = files.cover?.[0];
    const reportFile = files.file?.[0];
    const created = new this.reportModel({
      title: data.title,
      subtitle: data.subtitle || '',
      description: data.description || '',
      category: data.category,
      priceVnd: data.priceVnd,
      status: data.status,
      coverImagePath: coverFile ? this.saveToDisk(COVERS_DIR, coverFile) : '',
      filePath: reportFile ? this.saveToDisk(FILES_DIR, reportFile) : '',
      fileOriginalName: reportFile?.originalname || '',
    });
    return created.save();
  }

  async update(id: string, data: Partial<ReportInput>, files: ReportFiles) {
    const report = await this.reportModel.findById(id);
    if (!report) throw new NotFoundException('Report not found');

    if (data.title !== undefined) report.title = data.title;
    if (data.subtitle !== undefined) report.subtitle = data.subtitle;
    if (data.description !== undefined) report.description = data.description;
    if (data.category !== undefined) report.category = data.category;
    if (data.priceVnd !== undefined) report.priceVnd = data.priceVnd;
    if (data.status !== undefined) report.status = data.status;

    const coverFile = files.cover?.[0];
    if (coverFile) {
      this.deleteFromDisk(COVERS_DIR, report.coverImagePath);
      report.coverImagePath = this.saveToDisk(COVERS_DIR, coverFile);
    }
    const reportFile = files.file?.[0];
    if (reportFile) {
      this.deleteFromDisk(FILES_DIR, report.filePath);
      report.filePath = this.saveToDisk(FILES_DIR, reportFile);
      report.fileOriginalName = reportFile.originalname;
    }

    await report.save();
    return report;
  }

  async remove(id: string) {
    const report = await this.reportModel.findByIdAndDelete(id);
    if (!report) throw new NotFoundException('Report not found');
    this.deleteFromDisk(COVERS_DIR, report.coverImagePath);
    this.deleteFromDisk(FILES_DIR, report.filePath);
    return { deleted: true };
  }

  async getDownloadPath(id: string) {
    const report = await this.reportModel.findById(id).lean();
    if (!report || report.status !== 'published') throw new NotFoundException('Report not found');
    if (report.priceVnd > 0) throw new ForbiddenException('This report requires purchase — it is not available for free download');
    return this.resolveFilePath(report);
  }

  // Used for paid downloads once a ReportOrder has been marked 'paid' —
  // authorization comes from the order, not from the report's own price gate.
  async getDownloadPathForPaidOrder(id: string) {
    const report = await this.reportModel.findById(id).lean();
    if (!report || report.status !== 'published') throw new NotFoundException('Report not found');
    return this.resolveFilePath(report);
  }

  private resolveFilePath(report: Pick<Report, 'filePath' | 'fileOriginalName'>) {
    if (!report.filePath) throw new NotFoundException('No file has been uploaded for this report yet');
    return { path: join(FILES_DIR, report.filePath), filename: report.fileOriginalName || report.filePath };
  }
}
