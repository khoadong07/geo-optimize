import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Body, Controller, Delete, Get, Param, Patch, Post, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateReportDto, UpdateReportDto } from './dto';
import { ReportCategory, ReportStatus } from './report.schema';
import { ReportsService } from './reports.service';

const UPLOAD_FIELDS = [
  { name: 'cover', maxCount: 1 },
  { name: 'file', maxCount: 1 },
];

type UploadedReportFiles = { cover?: Express.Multer.File[]; file?: Express.Multer.File[] };

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  listPublic() {
    return this.reportsService.listPublic();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listAll() {
    return this.reportsService.listAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.reportsService.getPublicById(id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const { path, filename } = await this.reportsService.getDownloadPath(id);
    res.download(path, filename, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ message: 'Could not download file' });
      }
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileFieldsInterceptor(UPLOAD_FIELDS))
  create(@Body() body: CreateReportDto, @UploadedFiles() files: UploadedReportFiles) {
    return this.reportsService.create(
      {
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        category: body.category as ReportCategory,
        priceVnd: Number(body.priceVnd),
        status: body.status as ReportStatus,
      },
      files || {},
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileFieldsInterceptor(UPLOAD_FIELDS))
  update(@Param('id') id: string, @Body() body: UpdateReportDto, @UploadedFiles() files: UploadedReportFiles) {
    return this.reportsService.update(
      id,
      {
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        category: body.category as ReportCategory | undefined,
        priceVnd: body.priceVnd !== undefined ? Number(body.priceVnd) : undefined,
        status: body.status as ReportStatus | undefined,
      },
      files || {},
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }
}
