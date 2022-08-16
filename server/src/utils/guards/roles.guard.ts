import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import User from 'src/users/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import RequestWithUser from '../types/requestWithUser.interface';
import Role from '../types/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    const canAccess = requiredRoles.some((role) => user.role === role);
    return canAccess;
  }
}

// Admin can manange all entities
// Realtor can read all apartments, add apartments, update their own apartments and profile
// client can only read apartments and update their own profile.
