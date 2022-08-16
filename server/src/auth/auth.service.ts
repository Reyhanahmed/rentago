import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { Response } from 'express';

import CreateUserDto from 'src/users/dto/createUser.dto';
import { UsersService } from 'src/users/users.service';
import PostgresErrorCode from 'src/database/types/postgresErrorCode.enum';
import User from 'src/users/user.entity';
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from 'src/utils/constants';
import { TokenClaims, TokenData } from './types/tokenClaims.interface';
import Role from '../utils/types/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(userData: CreateUserDto) {
    try {
      const hashedPassword = await argon2.hash(userData.password);

      if (userData.role === Role.admin) {
        throw new ForbiddenException(
          'You cannot create a user with admin privileges',
        );
      }

      const user = await this.userService.create({
        ...userData,
        password: hashedPassword,
      });

      return user;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;

      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User with email already exists');
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.userService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      return user;
    } catch (error) {
      throw new BadRequestException('Wrong credentials provided');
    }
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string) {
    const isPasswordMatching = await argon2.verify(
      hashedPassword,
      plainPassword,
    );

    if (!isPasswordMatching) {
      throw new BadRequestException('Wrong credentials provided');
    }
  }

  async generateAndSaveAccessToken(claims: TokenData, res: Response) {
    const token = this.jwtService.sign(claims);
    res.cookie(ACCESS_TOKEN_NAME, token, {
      httpOnly: true,
      path: '/',
      maxAge: this.configService.get('ACCESS_TOKEN_EXPIRATION_TIME'),
    });
    return token;
  }

  async generateAndSaveRefreshToken(claims: TokenData, res: Response) {
    const expirationTimeInMilliseconds = this.configService.get(
      'REFRESH_TOKEN_EXPIRATION_TIME',
    );
    const token = this.jwtService.sign(claims, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: expirationTimeInMilliseconds / 1000, // convert into seconds, since jsonwebtoken library expects in seconds
    });
    await this.userService.updateRefreshToken(token, claims.id);
    res.cookie(REFRESH_TOKEN_NAME, token, {
      httpOnly: true,
      path: '/',
      maxAge: this.configService.get('REFRESH_TOKEN_EXPIRATION_TIME'),
    });
  }

  public async setJwtTokenCookies(user: User, res: Response) {
    const claims = { id: user?.id, role: user?.role };
    await this.generateAndSaveAccessToken(claims, res);
    await this.generateAndSaveRefreshToken(claims, res);
  }

  public validateAccessToken(token: string): TokenClaims {
    return this.jwtService.verify(token, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
    });
  }

  public validateRefreshToken(token: string): TokenClaims {
    return this.jwtService.verify(token, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
    });
  }

  public clearJwtTokenCookies(res: Response) {
    res.clearCookie(ACCESS_TOKEN_NAME);
    res.clearCookie(REFRESH_TOKEN_NAME);
  }
}
