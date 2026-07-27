import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { PlanOrderStatus } from './plan-order.schema';

export class CreatePlanOrderDto {
  @IsString()
  planSlug!: string;

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
  discountCode?: string;
}

export class SetPlanOrderStatusDto {
  @IsIn(['new', 'paid', 'contacted', 'fulfilled'])
  status!: PlanOrderStatus;
}

export class RequestLoginDto {
  @IsEmail()
  email!: string;
}
