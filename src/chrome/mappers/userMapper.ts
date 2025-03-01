import { User, UserTokenPayload } from '../domain/user';

type UserMappableFields = Pick<
  UserTokenPayload,
  'id' | 'email' | 'name' | 'verified'
>;

export const convertToUserFromTokenPayload = ({
  id,
  email,
  name,
  verified,
}: UserMappableFields): User => ({
  id,
  email,
  name: name || '',
  verified,
});
