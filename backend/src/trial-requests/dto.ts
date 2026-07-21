import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { TrialRequestStatus } from './trial-request.schema';

export class CreateTrialRequestDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  company!: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class SetTrialRequestStatusDto {
  @IsIn(['new', 'contacted', 'converted'])
  status!: TrialRequestStatus;
}
