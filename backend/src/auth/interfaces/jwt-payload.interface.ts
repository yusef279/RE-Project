import { UserRole } from '../../schemas/user.schema';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  profileId?: string; // parent/teacher profile id
}
