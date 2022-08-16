import {
  IsString,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

class Location {
  @IsLatitude()
  @IsNotEmpty()
  lat: number;

  @IsLongitude()
  @IsNotEmpty()
  long: number;
}

class CreateApartmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  floorArea: number;

  @IsNumber()
  @IsNotEmpty()
  rent: number;

  @IsNumber()
  @IsNotEmpty()
  rooms: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => Location)
  location: Location;

  @IsOptional()
  @IsNumber()
  realtorId: number;

  @IsUrl()
  @IsOptional()
  photo?: string;
}

export default CreateApartmentDto;
