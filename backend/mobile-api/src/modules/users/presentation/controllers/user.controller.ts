import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CompleteProfileUseCase } from '../../application/use-cases/complete-profile.use-case';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';
import { DeleteAccountUseCase } from '../../application/use-cases/delete-account.use-case';
import { InitialRegisterDto } from '../dtos/initial-register.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { DeleteAllDataUseCase } from '../../application/use-cases/delete-all-data.use-case';

@ApiTags('Perfil de Usuario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly completeProfileUseCase: CompleteProfileUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly deleteAllDataUseCase: DeleteAllDataUseCase,
  ) { }

  @Post('complete-profile')
  @ApiOperation({ summary: 'Primer registro de datos del paciente (Onboarding)' })
  async completeProfile(@Request() req: any, @Body() dto: InitialRegisterDto) {
    return this.completeProfileUseCase.execute(req.user.uid, dto);
  }

  @Get('onboarding-status')
  @ApiOperation({ summary: 'Verifica si el usuario ya completó el registro inicial' })
  async getStatus(@Request() req: any) {
    return this.completeProfileUseCase.checkStatus(req.user.uid);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiOkResponse({ description: 'Perfil del usuario.' })
  async getProfile(@Request() req: any) {
    return this.getProfileUseCase.execute(req.user.uid);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar perfil del usuario (apodo, pronombre, motivo, gasto)' })
  @ApiOkResponse({ description: 'Perfil actualizado.' })
  @ApiNotFoundResponse({ description: 'Perfil no encontrado.' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.updateProfileUseCase.execute(req.user.uid, dto);
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar cuenta del usuario autenticado' })
  @ApiOkResponse({ description: 'Cuenta eliminada.' })
  async deleteAccount(@Request() req: any) {
    return this.deleteAccountUseCase.execute(req.user.uid);
  }

  // En user.controller.ts — agregar junto a DELETE /user/account
  @Delete('all-data')
  @UseGuards(JwtAuthGuard)
  async deleteAllData(@Req() req: any) {
    await this.deleteAllDataUseCase.execute(req.user.uid);
    return { message: 'Todos tus datos han sido eliminados.' };
  }
}