import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOperator, ILike, Repository } from 'typeorm';

import { FilesService } from 'src/files/files.service';
import PostgresErrorCode from 'src/database/types/postgresErrorCode.enum';
import CreateUserDto from './dto/createUser.dto';
import User from './user.entity';
import UpdateUserDto from './dto/updateUser.dto';
import { GetUsersQueryParams } from './types/getUsersParams';
import { getPaginatedParams } from 'src/utils/getPaginatedParams';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { Action } from 'src/casl/types/actions.enum';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly filesService: FilesService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async getAll({ name, page, limit }: GetUsersQueryParams, user: User) {
    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can(Action.Read, User)) {
      throw new ForbiddenException();
    }
    const { take, skip } = getPaginatedParams(page, limit);
    const where: { name?: FindOperator<string> } = {};

    if (name) {
      where.name = ILike(`%${name}%`);
    }

    const [users, count] = await this.usersRepository.findAndCount({
      where,
      take,
      skip,
      order: {
        createdAt: 'DESC',
      },
    });

    return { users, count };
  }

  async getById(id: number, loggedInUser?: User) {
    const user = await this.usersRepository.findOne(id);
    if (loggedInUser) {
      const ability = this.caslAbilityFactory.createForUser(loggedInUser);
      if (!ability.can(Action.Read, user)) {
        throw new ForbiddenException();
      }
    }

    if (user) return user;

    throw new NotFoundException(`User with this id ${id} does not exist`);
  }

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({ email });

    if (user) return user;

    throw new BadRequestException('User with this email does not exist');
  }

  async create(userData: CreateUserDto) {
    const newUser = await this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async createUserForAdmin(userData: CreateUserDto) {
    try {
      const hashedPassword = await argon2.hash(userData.password);
      const user = await this.usersRepository.create({
        ...userData,
        password: hashedPassword,
      });

      await this.usersRepository.save(user);

      return user;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User with email already exists');
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async update(id: number, userData: UpdateUserDto, loggedInUser: User) {
    try {
      const userToBeUpdated = await this.usersRepository.findOne(id);
      if (loggedInUser) {
        const ability = this.caslAbilityFactory.createForUser(loggedInUser);
        if (!ability.can(Action.Update, userToBeUpdated)) {
          throw new ForbiddenException();
        }
      }
      await this.usersRepository.update(id, userData);
      const user = await this.usersRepository.findOne(id);

      if (user) return user;

      throw new NotFoundException(`User not found`);
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User with email already exists');
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async delete(id: number) {
    const deletedUser = await this.usersRepository.delete(id);

    if (!deletedUser.affected) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async updateRefreshToken(token: string, userId: number) {
    await this.usersRepository.update(userId, {
      refreshToken: token,
    });
  }

  async addAvatar(imageBuffer: Buffer, filename: string, user: User) {
    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can(Action.Update, User)) {
      throw new ForbiddenException();
    }
    const avatarUrl = await this.filesService.uploadFile(imageBuffer, filename);
    return avatarUrl;
  }
}
