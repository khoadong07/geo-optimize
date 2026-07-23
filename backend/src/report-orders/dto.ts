import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ReportOrderStatus } from './report-order.schema';

export class CreateReportOrderDto {
  @IsString()
  reportId!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  discountCode?: string;
}

export class SetReportOrderStatusDto {
  @IsIn(['new', 'paid', 'contacted', 'fulfilled'])
  status!: ReportOrderStatus;
}
