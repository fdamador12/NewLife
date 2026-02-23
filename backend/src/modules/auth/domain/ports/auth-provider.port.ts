import { UserAuthEntity } from '../entities/user-auth.entity';

export interface IAuthProviderPort {
  login(email: string, password: string): Promise<UserAuthEntity>;
  register(data: { email: string; password: string; name: string; rol: string }): Promise<UserAuthEntity>;
  verifyToken(token: string): Promise<any>;
}