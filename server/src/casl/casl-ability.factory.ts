import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  Ability,
  AbilityClass,
  ExtractSubjectType,
} from '@casl/ability';
import User from 'src/users/user.entity';
import { AppAbility, CaslApartment, Subjects } from './types/casl.types';
import Role from 'src/utils/types/roles.enum';
import { Action } from './types/actions.enum';
import Apartment from 'src/apartments/apartment.entity';

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    if (user.role === Role.admin) {
      can(Action.Manage, 'all');
    } else if (user.role === Role.realtor) {
      can(Action.Read, Apartment);
      can(Action.Create, Apartment);
      can<CaslApartment>(Action.Update, Apartment, { 'realtor.id': user.id });
      can<CaslApartment>(Action.Delete, Apartment, { 'realtor.id': user.id });
      can(Action.Read, User, { id: user.id });
      can(Action.Update, User, { id: user.id });
    } else if (user.role === Role.client) {
      can(Action.Read, Apartment);
      can(Action.Read, User, { id: user.id });
      can(Action.Update, User, { id: user.id });
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
