import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsUrl,
  IsLatitude,
  IsNotEmpty,
  IsLongitude,
} from 'class-validator';

class Location {
  @IsLatitude()
  @IsNotEmpty()
  lat: number;

  @IsLongitude()
  @IsNotEmpty()
  long: number;
}

class UpdateApartmentDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  floorArea: number;

  @IsNumber()
  @IsOptional()
  rent: number;

  @IsNumber()
  @IsOptional()
  rooms: number;

  @IsString()
  @IsOptional()
  address: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => Location)
  location: Location;

  @IsOptional()
  @IsNumber()
  realtorId: number;

  @IsUrl()
  @IsOptional()
  photo?: string;
}

export default UpdateApartmentDto;
