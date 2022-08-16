import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { request } from 'http';

import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import FindOneParams from 'src/utils/types/findOneParams';
import RequestWithUser from 'src/utils/types/requestWithUser.interface';
import Role from 'src/utils/types/roles.enum';
import CreateUserDto from './dto/createUser.dto';
import UpdateUserDto from './dto/updateUser.dto';
import { GetUsersQueryParams } from './types/getUsersParams';
import { UsersService } from './users.service';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  getAll(
    @Query() { name, page, limit = 4 }: GetUsersQueryParams,
    @Req() req: RequestWithUser,
  ) {
    return this.usersService.getAll(
      {
        name,
        page,
        limit,
      },
      req.user,
    );
  }

  @Get(':id')
  getUserById(@Param() { id }: FindOneParams, @Req() req: RequestWithUser) {
    return this.usersService.getById(Number(id), req.user);
  }

  @Post()
  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  create(@Body() user: CreateUserDto) {
    return this.usersService.createUserForAdmin(user);
  }

  @Patch(':id')
  update(
    @Body() user: UpdateUserDto,
    @Param() { id }: FindOneParams,
    @Req() req: RequestWithUser,
  ) {
    return this.usersService.update(Number(id), user, req.user);
  }

  @Delete(':id')
  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  delete(@Param() { id }: FindOneParams) {
    return this.usersService.delete(Number(id));
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('photo'))
  addAvatar(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.addAvatar(
      file.buffer,
      file.originalname,
      req.user,
    );
  }
}
