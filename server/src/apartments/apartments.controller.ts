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

import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import FindOneParams from 'src/utils/types/findOneParams';
import RequestWithUser from 'src/utils/types/requestWithUser.interface';
import Role from 'src/utils/types/roles.enum';
import { ApartmentsService } from './apartments.service';
import CreateApartmentDto from './dto/createApartment.dto';
import UpdateApartmentDto from './dto/updateApartment.dto';
import { GetApartmentsQueryParams } from './types/getApartmentsParams';

@Controller('apartments')
@UseInterceptors(ClassSerializerInterceptor)
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Get()
  getAll(
    @Query()
    {
      page,
      name,
      rooms,
      floorArea,
      rentMin,
      rentMax,
      lat,
      long,
      limit = 4,
    }: GetApartmentsQueryParams,
  ) {
    if (lat && long) {
      return this.apartmentsService.getAllNearby({
        page,
        limit,
        name,
        rooms,
        floorArea,
        rentMin,
        rentMax,
        long,
        lat,
      });
    }
    return this.apartmentsService.getAll({
      page,
      limit,
      name,
      rooms,
      floorArea,
      rentMin,
      rentMax,
    });
  }

  @Get(':id')
  getById(@Param() { id }: FindOneParams) {
    return this.apartmentsService.getById(Number(id));
  }

  @Post()
  @Roles(Role.realtor, Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() apartment: CreateApartmentDto, @Req() req: RequestWithUser) {
    return this.apartmentsService.create(apartment, req.user);
  }

  @Patch(':id')
  @Roles(Role.realtor, Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Body() apartment: UpdateApartmentDto,
    @Param() { id }: FindOneParams,
    @Req() req: RequestWithUser,
  ) {
    return this.apartmentsService.update(Number(id), apartment, req.user);
  }

  @Delete(':id')
  @Roles(Role.realtor, Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  delete(@Param() { id }: FindOneParams, @Req() req: RequestWithUser) {
    return this.apartmentsService.delete(Number(id), req.user);
  }

  @Post('photo')
  @Roles(Role.realtor, Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('photo'))
  addPhoto(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.apartmentsService.addPhoto(
      file.buffer,
      file.originalname,
      req.user,
    );
  }
}
