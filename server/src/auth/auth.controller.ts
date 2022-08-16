import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';

import CreateUserDto from 'src/users/dto/createUser.dto';
import RequestWithUser from 'src/utils/types/requestWithUser.interface';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { LocalAuthGuard } from './guards/localAuth.guard';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  public async signup(@Body() userData: CreateUserDto, @Req() req: Request) {
    const user = await this.authService.signup(userData);
    await this.authService.setJwtTokenCookies(user, req.res);

    return user;
  }

  @HttpCode(200)
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  public async signin(@Req() req: RequestWithUser) {
    const { user } = req;
    await this.authService.setJwtTokenCookies(user, req.res);

    return user;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  public async me(@Req() req: RequestWithUser) {
    const { user } = req;

    return user;
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  public logout(@Req() req: RequestWithUser) {
    return this.authService.clearJwtTokenCookies(req.res);
  }
}
