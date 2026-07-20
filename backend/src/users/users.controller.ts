import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUserDto, SetRoleDto } from './dto';
import { DEFAULT_PASSWORD, UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list() {
    return this.usersService.list();
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body.username, DEFAULT_PASSWORD, body.role, true);
  }

  @Patch(':id/role')
  setRole(@Param('id') id: string, @Body() body: SetRoleDto) {
    return this.usersService.setRole(id, body.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
