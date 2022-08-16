import Role from 'src/utils/types/roles.enum';

export interface TokenClaims extends TokenData {
  iat: number;
  exp: number;
}

export interface TokenData {
  id: number;
  role: Role;
}
