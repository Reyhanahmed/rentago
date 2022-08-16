import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Point } from 'geojson';
import {
  Between,
  Equal,
  FindOperator,
  ILike,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { FilesService } from 'src/files/files.service';
import User from 'src/users/user.entity';
import Apartment from './apartment.entity';
import CreateApartmentDto from './dto/createApartment.dto';
import { UsersService } from 'src/users/users.service';
import { GetApartmentsQueryParams } from './types/getApartmentsParams';
import { getPaginatedParams } from 'src/utils/getPaginatedParams';
import UpdateApartmentDto from './dto/updateApartment.dto';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { Action } from 'src/casl/types/actions.enum';
import { NEAREST_APARTMENT_RANGE } from 'src/utils/constants';

@Injectable()
export class ApartmentsService {
  constructor(
    @InjectRepository(Apartment)
    private readonly apartmentRepository: Repository<Apartment>,
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async getAll({
    page,
    limit,
    name,
    rentMin,
    rentMax,
    rooms,
    floorArea,
  }: GetApartmentsQueryParams) {
    const { take, skip } = getPaginatedParams(page, limit);
    const where: {
      name?: FindOperator<string>;
      rent?: FindOperator<number>;
      rooms?: FindOperator<number>;
      floorArea?: FindOperator<number>;
    } = {};

    if (name) {
      where.name = ILike(`%${name}%`);
    }

    if (rentMin && rentMax) {
      where.rent = Between(Number(rentMin), Number(rentMax));
    }

    if (rooms) {
      const parsedRooms = Number(rooms);

      if (parsedRooms < 4) {
        where.rooms = Equal(parsedRooms);
      } else if (parsedRooms >= 4) {
        where.rooms = MoreThanOrEqual(parsedRooms);
      }
    }

    if (floorArea) {
      where.floorArea = Equal(Number(floorArea));
    }

    const [apartments, count] = await this.apartmentRepository.findAndCount({
      where,
      skip,
      take,
      relations: ['realtor'],
      order: {
        createdAt: 'DESC',
      },
    });

    return { apartments, count };
  }

  async getAllNearby({
    page,
    limit,
    name,
    rentMin,
    rentMax,
    rooms,
    floorArea,
    lat,
    long,
  }: GetApartmentsQueryParams) {
    const { take, skip } = getPaginatedParams(page, limit);
    const originLocation = {
      type: 'Point',
      coordinates: [long, lat],
    };

    let query = this.apartmentRepository
      .createQueryBuilder('apartments')
      .innerJoinAndSelect('apartments.realtor', 'user')
      .where(
        'ST_DWithin(ST_Transform(location, 5643), ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(location)), 5643), :range)',
        {
          origin: JSON.stringify(originLocation),
          range: NEAREST_APARTMENT_RANGE,
        },
      );

    if (name) {
      query = query.andWhere('apartments.name ILIKE :pName', {
        pName: `%${name}%`,
      });
    }

    if (rooms) {
      const parsedRooms = Number(rooms);
      query = query.andWhere(
        parsedRooms >= 4
          ? 'apartments.rooms >= :pRooms'
          : 'apartments.rooms = :pRooms',
        { pRooms: parsedRooms },
      );
    }

    if (floorArea) {
      query = query.andWhere('apartments.floorArea = :pFloorArea', {
        pFloorArea: floorArea,
      });
    }

    if (rentMax && rentMin) {
      query = query.andWhere(
        'apartments.rent BETWEEN :pRentMin AND :pRentMax',
        {
          pRentMin: rentMin,
          pRentMax: rentMax,
        },
      );
    }

    const [apartments, count] = await query
      .skip(skip)
      .take(take)
      .orderBy('apartments.createdAt', 'DESC')
      .getManyAndCount();

    return {
      apartments,
      count,
    };
  }

  async getById(id: number) {
    const apartment = await this.apartmentRepository.findOne(id, {
      relations: ['realtor'],
    });

    if (apartment) return apartment;

    throw new NotFoundException(`Apartment with id ${id} not found`);
  }

  async create(apartment: CreateApartmentDto, user: User) {
    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can(Action.Create, Apartment)) {
      throw new ForbiddenException();
    }

    let foundUser: User;
    const { location, realtorId, ...restApartment } = apartment;
    const loc: Point = {
      type: 'Point',
      coordinates: [location.long, location.lat],
    };

    if (realtorId) {
      foundUser = await this.usersService.getById(realtorId);
    }

    const createdApartment = await this.apartmentRepository.create({
      ...restApartment,
      location: loc,
      realtor: realtorId ? foundUser : user,
    });

    await this.apartmentRepository.save(createdApartment);

    return createdApartment;
  }

  async update(apartmentId: number, apartment: UpdateApartmentDto, user: User) {
    try {
      const foundApartment = await this.apartmentRepository.findOne(
        apartmentId,
        {
          relations: ['realtor'],
        },
      );
      const ability = this.caslAbilityFactory.createForUser(user);
      if (!ability.can(Action.Update, foundApartment)) {
        throw new ForbiddenException();
      }

      let foundUser: User;
      let loc: Point;
      const { location, realtorId, ...restApartment } = apartment;
      let newApartment: Partial<Apartment> = {
        ...restApartment,
      };

      if (location) {
        loc = {
          type: 'Point',
          coordinates: [location.long, location.lat],
        };

        newApartment = {
          ...newApartment,
          location: loc,
        };
      }

      if (realtorId) {
        foundUser = await this.usersService.getById(realtorId);
        newApartment = {
          ...newApartment,
          realtor: foundUser,
        };
      }
      await this.apartmentRepository.update(apartmentId, newApartment);

      const currentApartment = await this.apartmentRepository.findOne(
        apartmentId,
      );

      if (currentApartment) return currentApartment;

      throw new NotFoundException('Apartment not found');
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async delete(id: number, user: User) {
    const apartmentToBeDelete = await this.apartmentRepository.findOne(id, {
      relations: ['realtor'],
    });
    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can(Action.Delete, apartmentToBeDelete)) {
      throw new ForbiddenException();
    }

    const deletedApartment = await this.apartmentRepository.delete(id);

    if (!deletedApartment.affected) {
      throw new NotFoundException(`Apartment with id ${id} not found`);
    }
  }

  async addPhoto(imageBuffer: Buffer, filename: string, user: User) {
    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can(Action.Create, Apartment)) {
      throw new ForbiddenException();
    }
    const avatarUrl = await this.filesService.uploadFile(imageBuffer, filename);

    return avatarUrl;
  }
}
