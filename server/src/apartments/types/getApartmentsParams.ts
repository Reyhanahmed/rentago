import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationParams } from 'src/utils/types/paginationParams';

class GetApartmentsParams {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  rentMin?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  rentMax?: number;

  @IsString()
  @IsOptional()
  @Type(() => String)
  name?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  rooms?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  floorArea?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  long?: number;
}

export type GetApartmentsQueryParams = GetApartmentsParams & PaginationParams;
