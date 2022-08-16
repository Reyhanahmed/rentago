import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import Role from 'src/utils/types/roles.enum';
import Apartment from 'src/apartments/apartment.entity';

@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public email: string;

  @Column()
  @Exclude()
  public password: string;

  @Column({
    nullable: true,
  })
  public name?: string;

  @Column({
    default: Role.client,
  })
  public role: Role;

  @Column({
    nullable: true,
    default:
      'https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png',
  })
  public photo?: string;

  @Column({
    name: 'refresh_token',
    nullable: true,
  })
  @Exclude()
  public refreshToken?: string;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
  })
  public createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    nullable: true,
  })
  public updatedAt?: Date;

  @OneToMany(() => Apartment, (apartment: Apartment) => apartment.realtor)
  apartments?: Apartment[];
}

export default User;
