import { Injectable, Inject } from '@nestjs/common';
import { LoginUseCase } from '../use-cases/login.use-case';
import { RegisterUseCase } from '../use-cases/register.use-case';
import { RegisterStaffUseCase } from '../use-cases/register-staff.use-case';
import { LoginDto } from '../../presentation/dtos/login.dto';
import { RegisterDto } from '../../presentation/dtos/register.dto';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly registerStaffUseCase: RegisterStaffUseCase,
    @Inject('IAuthProviderPort')
    private readonly authProvider: IAuthProviderPort,
  ) {}

  async login(loginDto: LoginDto, allowedRoles?: string[]) {
    return await this.loginUseCase.execute(loginDto, allowedRoles);
  }

  async register(registerDto: RegisterDto) {
    return await this.registerUseCase.execute(registerDto);
  }

  async registerStaff(registerDto: RegisterDto, role: string) {
    return await this.registerStaffUseCase.execute(registerDto, role);
  }

  async refreshToken(token: string) {
    return await this.authProvider.refreshToken(token);
  }
  
  async logout(token: string) {
    return await this.authProvider.logout(token);
  }

  async forgotPassword(email: string) {
    return await this.authProvider.forgotPassword(email);
  }

  async verifyEmail(email: string, code: string) {
    return await this.authProvider.verifyEmail(email, code);
  }

  async resetPassword(token: string, pass: string) {
    return await this.authProvider.resetPassword(token, pass);
  }
}