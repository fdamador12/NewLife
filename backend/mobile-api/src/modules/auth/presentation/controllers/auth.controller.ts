import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { RegisterStaffUseCase } from '../../application/use-cases/register-staff.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { MigrateGuestUseCase } from '../../application/use-cases/migrate-guest.use-case';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { MigrateGuestDto } from '../dtos/migrate-guest.dto';
import { VerifyEmailDto } from '../dtos/verify-email.dto';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
    private registerStaffUseCase: RegisterStaffUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private migrateGuestUseCase: MigrateGuestUseCase,
    private verifyEmailUseCase: VerifyEmailUseCase,
    @Inject('IAuthProviderPort')
    private readonly authProvider: IAuthProviderPort,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.loginUseCase.execute(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return await this.registerUseCase.execute(registerDto);
  }

  @Post('web/login')
  @HttpCode(HttpStatus.OK)
  async webLogin(@Body() loginDto: LoginDto) {
    return await this.loginUseCase.execute(loginDto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.verifyEmailUseCase.execute(dto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refreshToken: string }) {
    return await this.refreshTokenUseCase.execute(body.refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    try {
      await this.authProvider.forgotPassword(body.email);
      return { message: 'Correo de recuperación enviado' };
    } catch (error) {
      return { message: 'Si el email existe, recibirás instrucciones' };
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    await this.authProvider.resetPassword(body.token, body.newPassword);
    return { message: 'Contraseña actualizada correctamente' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    try {
      await this.authProvider.logout(req.user.accessToken);
    } catch {
      // No es crítico si falla el logout en Roble
    }
    return { message: 'Sesión cerrada correctamente' };
  }

  @Post('verify-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Request() req) {
    return {
      valid: true,
      user: {
        uid: req.user.uid,
        email: req.user.email,
        role: req.user.role,
      },
    };
  }

  @Post('migrate-guest')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async migrateGuest(
    @Request() req,
    @Body() migrateGuestDto: MigrateGuestDto,
  ) {
    const usuarioId = req.user.uid;
    await this.migrateGuestUseCase.execute(usuarioId, migrateGuestDto);
    return { message: 'Datos migrados correctamente' };
  }
}