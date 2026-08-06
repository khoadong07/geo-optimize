import { ArrayMinSize, IsArray, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTrendingTopicDto {
  @IsString()
  @MinLength(1)
  industry!: string;

  @IsIn(['week', 'month'])
  period!: 'week' | 'month';

  @IsOptional()
  @IsIn(['en', 'vi'])
  lang?: 'en' | 'vi';

  @IsString()
  @MinLength(3)
  text!: string;
}

export class CreateTrendingTopicsBulkDto {
  @IsString()
  @MinLength(1)
  industry!: string;

  @IsIn(['week', 'month'])
  period!: 'week' | 'month';

  @IsOptional()
  @IsIn(['en', 'vi'])
  lang?: 'en' | 'vi';

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  texts!: string[];
}

export class UpdateTrendingTopicDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  industry?: string;

  @IsOptional()
  @IsIn(['week', 'month'])
  period?: 'week' | 'month';

  @IsOptional()
  @IsIn(['en', 'vi'])
  lang?: 'en' | 'vi';

  @IsOptional()
  @IsString()
  @MinLength(3)
  text?: string;
}
