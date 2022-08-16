import * as request from 'supertest';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ValidationError } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import * as argon2 from 'argon2';

import { UsersService } from 'src/users/users.service';
import HttpExceptionFilter from 'src/utils/filters/httpException.filter';
import { ExcludeNullInterceptor } from 'src/utils/interceptors/excludeNull.interceptor';
import { SerializationInterceptor } from 'src/utils/interceptors/serialization.interceptor';
import mockedConfigService from 'src/utils/mocks/config.service';
import mockedJwtService from 'src/utils/mocks/jwt.service';
import User from 'src/users/user.entity';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import mockedUser from './user.mock';
import { LocalStrategy } from '../strategies/local.strategy';
import { FilesService } from 'src/files/files.service';
import mockedFilesService from 'src/utils/mocks/files.service';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';

jest.mock('argon2', () => ({
  verify: jest.fn(),
  hash: jest.fn(() => 'kdsflasdjfl'),
}));

describe('AuthController', () => {
  let app: INestApplication;
  let userData: User;
  let userRepository: Record<string, jest.Mock>;
  let verify: jest.Mock;

  beforeEach(async () => {
    userData = {
      ...mockedUser,
    };

    userRepository = {
      create: jest.fn(() => {
        const { password, refreshToken, ...rest } = userData;

        return rest;
      }),
      save: jest.fn(() => Promise.resolve()),
      update: jest.fn(),
      findOne: jest.fn(),
    };

    verify = jest.fn(() => true);

    (argon2.verify as jest.Mock) = verify;

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        UsersService,
        AuthService,
        LocalStrategy,
        CaslAbilityFactory,
        {
          provide: FilesService,
          useValue: mockedFilesService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (validationErrors: ValidationError[] = []) => {
          const mappedValidationErrors = validationErrors.map((error) => ({
            [error.property]: Object.values(error.constraints)[0],
          }));
          return new BadRequestException(mappedValidationErrors);
        },
      }),
    );
    app.setGlobalPrefix('/api');
    app.useGlobalInterceptors(new ExcludeNullInterceptor());
    app.useGlobalInterceptors(new SerializationInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.use(cookieParser());

    await app.init();
  });

  describe('when signing up', () => {
    describe('and using valid data', () => {
      it('should response with user data without password', () => {
        const { password, refreshToken, createdAt, ...expectedData } = userData;
        return request(app.getHttpServer())
          .post('/api/auth/signup')
          .send({
            email: mockedUser.email,
            name: mockedUser.name,
            role: mockedUser.role,
            password: mockedUser.password,
          })
          .expect(201)
          .expect({
            status: 'success',
            statusCode: 201,
            data: { ...expectedData, createdAt: createdAt.toISOString() },
          });
      });
    });

    describe('and using invalid data', () => {
      it('should return response with error message with status 400', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signup')
          .send({
            email: 'abc.com',
            name: 123,
            role: mockedUser.role,
            password: '123',
          })
          .expect(400)
          .expect({
            status: 'fail',
            statusCode: 400,
            data: [
              {
                email: 'email must be an email',
              },
              {
                name: 'name must be a string',
              },
              {
                password:
                  'password must be longer than or equal to 6 characters',
              },
            ],
          });
      });
    });
  });

  describe('when logging in', () => {
    const { password, refreshToken, ...expectedData } = mockedUser;
    describe('and the data is valid', () => {
      beforeEach(() => {
        userRepository.findOne.mockReturnValue(expectedData);
      });
      it('should return user data', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'user@email.com',
            password: '123456',
          })
          .expect(200)
          .expect({
            status: 'success',
            statusCode: 200,
            data: {
              ...expectedData,
              createdAt: expectedData.createdAt.toISOString(),
            },
          });
      });
    });

    describe('and the data is invalid', () => {
      beforeEach(() => {
        userRepository.findOne.mockReturnValue(undefined);
      });
      it('should return user data', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'user@email.com',
            password: '123456',
          })
          .expect(400)
          .expect({
            status: 'fail',
            statusCode: 400,
            data: ['Wrong credentials provided'],
          });
      });
    });
  });
});
