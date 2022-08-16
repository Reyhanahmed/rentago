import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';
import User from 'src/users/user.entity';
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from 'src/utils/constants';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import { TokenClaims } from '../types/tokenClaims.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpCtx = context.switchToHttp();
    const request: Request = httpCtx.getRequest();
    const response: Response = httpCtx.getResponse();

    const accessToken = ExtractJwt.fromExtractors([
      (request: Request) => {
        return request?.cookies?.[ACCESS_TOKEN_NAME];
      },
    ])(request);

    let decodedAccessToken: TokenClaims;
    let decodedRefreshToken: TokenClaims;
    try {
      decodedAccessToken = this.authService.validateAccessToken(accessToken);
    } catch (error) {}

    const isAccessTokenValid =
      Boolean(decodedAccessToken) && decodedAccessToken.exp > Date.now() / 1000;

    if (isAccessTokenValid) {
      return this.activate(context);
    }

    const refreshToken = ExtractJwt.fromExtractors([
      (request: Request) => {
        return request?.cookies?.[REFRESH_TOKEN_NAME];
      },
    ])(request);

    try {
      decodedRefreshToken = this.authService.validateRefreshToken(refreshToken);
    } catch (error) {}

    if (!Boolean(decodedRefreshToken)) throw new UnauthorizedException();

    const savedRefreshToken = (
      await this.userRepository.findOne(decodedRefreshToken?.id)
    )?.refreshToken;

    const isRefreshTokenValid =
      Boolean(refreshToken) &&
      decodedRefreshToken.exp > Date.now() / 1000 &&
      savedRefreshToken === refreshToken;

    if (!isRefreshTokenValid) throw new UnauthorizedException();

    const token = await this.authService.generateAndSaveAccessToken(
      {
        id: decodedRefreshToken.id,
        role: decodedRefreshToken.role,
      },
      response,
    );

    request.cookies[ACCESS_TOKEN_NAME] = token;

    return this.activate(context);
  }
  async activate(context: ExecutionContext): Promise<boolean> {
    return super.canActivate(context) as Promise<boolean>;
  }
}
