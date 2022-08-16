import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Point } from 'geojson';
import { Transform } from 'class-transformer';

import User from 'src/users/user.entity';

@Entity('apartments')
class Apartment {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public description: string;

  @Column({ name: 'floor_area' })
  public floorArea: number;

  @Column()
  public rent: number;

  @Column()
  public rooms: number;

  @Column()
  public address: string;

  @Column({
    nullable: true,
    default:
      'http://www.fcpg.com.au/wp-content/uploads/2015/03/dummyproperty.jpg',
  })
  public photo: string;

  @Column({
    default: true,
  })
  public available: boolean;

  @Transform(({ value }) => {
    const [long, lat] = value?.coordinates;
    return { lat, long };
  })
  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  public location: Point;

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

  @ManyToOne(() => User, (user: User) => user.apartments, {
    onDelete: 'CASCADE',
  })
  public realtor: User;
}

export default Apartment;
