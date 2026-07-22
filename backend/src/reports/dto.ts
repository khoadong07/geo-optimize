import { IsIn, IsNumberString, IsOptional, IsString, MinLength } from 'class-validator';
import { REPORT_CATEGORIES } from './report.schema';

export class CreateReportDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(REPORT_CATEGORIES)
  category!: string;

  @IsNumberString()
  priceVnd!: string;

  @IsIn(['draft', 'published', 'coming_soon'])
  status!: string;
}

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(REPORT_CATEGORIES)
  category?: string;

  @IsOptional()
  @IsNumberString()
  priceVnd?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'coming_soon'])
  status?: string;
}
