import { InferSubjects, Ability } from '@casl/ability';
import Apartment from 'src/apartments/apartment.entity';
import User from 'src/users/user.entity';
import { Action } from './actions.enum';

export type Subjects = InferSubjects<typeof Apartment | typeof User> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

export type CaslApartment = Apartment & {
  'realtor.id': Apartment['realtor']['id'];
};
