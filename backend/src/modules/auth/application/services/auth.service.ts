import { Injectable } from '@nestjs/common';
import { LoginUseCase } from '../use-cases/login.use-case';
import { RegisterUseCase } from '../use-cases/register.use-case';
import { LoginDto } from '../../presentation/dtos/login.dto';
import { RegisterDto } from '../../presentation/dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) { }

  async login(loginDto: LoginDto) {
    return await this.loginUseCase.execute(loginDto);
  }

  async register(registerDto: RegisterDto) {
    return await this.registerUseCase.execute(registerDto);
  }
}