import { IsArray, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { TrialLeadStatus } from './trial-lead.schema';

const ZONES = ['vietnam', 'thailand', 'indonesia', 'international'];

export class AnalyzeDto {
  @IsString()
  @MinLength(3)
  domain!: string;

  @IsIn(ZONES)
  zone!: string;
}

export class SetupDto {
  @IsArray()
  @IsString({ each: true })
  competitors!: string[];

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  brandName?: string;

  @IsOptional()
  @IsIn(['en', 'vi'])
  lang?: 'en' | 'vi';
}

export class CaptureLeadDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  company?: string;
}

export class SetLeadStatusDto {
  @IsIn(['new', 'contacted', 'converted'])
  status!: TrialLeadStatus;
}
