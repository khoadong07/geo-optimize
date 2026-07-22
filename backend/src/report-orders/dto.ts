import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ReportOrderStatus } from './report-order.schema';

export class CreateReportOrderDto {
  @IsString()
  reportId!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  company?: string;
}

export class SetReportOrderStatusDto {
  @IsIn(['new', 'contacted', 'fulfilled'])
  status!: ReportOrderStatus;
}
