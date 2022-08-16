import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as argon2 from 'argon2';

import User from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import mockedConfigService from 'src/utils/mocks/config.service';
import mockedJwtService from 'src/utils/mocks/jwt.service';
import CreateUserDto from 'src/users/dto/createUser.dto';
import PostgresErrorCode from 'src/database/types/postgresErrorCode.enum';
import { AuthService } from '../auth.service';
import mockedUser from './user.mock';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { FilesService } from 'src/files/files.service';
import mockedFilesService from 'src/utils/mocks/files.service';

jest.mock('argon2', () => ({
  hash: jest.fn(() => ''),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let create: jest.Mock;
  let save: jest.Mock;
  let hash: jest.Mock;
  let verify: jest.Mock;
  let findOne: jest.Mock;
  let userData: User;
  let authService: AuthService;

  beforeEach(async () => {
    userData = {
      ...mockedUser,
    };

    create = jest.fn((data) => data);
    save = jest.fn(() => Promise.resolve());
    hash = jest.fn((pass) => `hash_${pass}`);
    verify = jest.fn(() => true);
    findOne = jest.fn(() => userData);

    (argon2.hash as jest.Mock) = hash;
    (argon2.verify as jest.Mock) = verify;

    const userRepository = {
      create,
      save,
      findOne,
    };
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthService,
        CaslAbilityFactory,
        {
          provide: FilesService,
          useValue: mockedFilesService,
        },
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    authService = module.get(AuthService);
  });

  describe('when creating a new user', () => {
    describe('and the data is valid', () => {
      it('should return with data of user', async () => {
        const result = await authService.signup(mockedUser as CreateUserDto);
        expect(result).toEqual({
          ...mockedUser,
          password: `hash_${mockedUser.password}`,
        });
      });
    });

    describe('and the data is invalid', () => {
      describe('and the user is already registered', () => {
        beforeEach(() => {
          create.mockImplementation(() =>
            Promise.reject({ code: PostgresErrorCode.UniqueViolation }),
          );
        });

        it('should throw an error', async () => {
          await expect(
            authService.signup(mockedUser as CreateUserDto),
          ).rejects.toThrow('User with email already exists');
        });
      });
    });
  });

  describe('when accessing the data of authenticating user', () => {
    it('should get the user by email', async () => {
      await authService.getAuthenticatedUser('user@email.com', 'somePassword');
      expect(findOne).toHaveBeenCalledTimes(1);
    });

    describe('and the provided data is valid', () => {
      describe('and the user is found in the database', () => {
        it('should return the user data', async () => {
          const user = await authService.getAuthenticatedUser(
            'user@email.com',
            'somePassword',
          );
          expect(user).toBe(userData);
        });
      });

      describe('and the user is not found in the database', () => {
        beforeEach(() => {
          findOne.mockReturnValue(undefined);
        });

        it('should throw an error', async () => {
          await expect(
            authService.getAuthenticatedUser('user@email.com', 'somePassword'),
          ).rejects.toThrow('Wrong credentials provided');
        });
      });
    });

    describe('and the data provided is invalid', () => {
      beforeEach(() => {
        verify.mockReturnValue(false);
      });

      it('should throw an error', async () => {
        await expect(
          authService.getAuthenticatedUser('user@email.com', 'somePassword'),
        ).rejects.toThrow('Wrong credentials provided');
      });
    });
  });
});
