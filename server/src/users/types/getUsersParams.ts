import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationParams } from 'src/utils/types/paginationParams';

class GetUsersParams {
  @IsString()
  @IsOptional()
  @Type(() => String)
  name?: string;
}

export type GetUsersQueryParams = GetUsersParams & PaginationParams;
