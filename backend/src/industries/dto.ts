import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateIndustryDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  labelEn!: string;

  @IsString()
  @MinLength(1)
  labelVi!: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class UpdateIndustryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  labelEn?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  labelVi?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
