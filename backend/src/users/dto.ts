import { IsIn, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsIn(['admin', 'user'])
  role!: 'admin' | 'user';
}

export class SetRoleDto {
  @IsIn(['admin', 'user'])
  role!: 'admin' | 'user';
}
