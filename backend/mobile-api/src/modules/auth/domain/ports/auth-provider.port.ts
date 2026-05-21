import { UserAuthEntity } from '../entities/user-auth.entity';

export interface IAuthProviderPort {
  login(email: string, password: string): Promise<UserAuthEntity>;
  register(data: { email: string; password: string; name: string }): Promise<UserAuthEntity>;
  verifyToken(token: string): Promise<any>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string }>;
  logout(accessToken: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  verifyEmail(email: string, code: string): Promise<void>;
}