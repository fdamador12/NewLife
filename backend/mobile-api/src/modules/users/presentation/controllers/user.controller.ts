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
  ApiBody,
} from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CompleteProfileUseCase } from '../../application/use-cases/complete-profile.use-case';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';
import { DeleteAccountUseCase } from '../../application/use-cases/delete-account.use-case';
import { InitialRegisterDto } from '../dtos/initial-register.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { DeleteAllDataUseCase } from '../../application/use-cases/delete-all-data.use-case';

/**
 * DTO para el body del endpoint DELETE /user/all-data.
 *
 * El motivo es OPCIONAL: si el usuario decide compartir por que se va, lo
 * guardamos en `usuarios.delete_motivo` para retroalimentacion del producto.
 * Movil envia este motivo desde el modal de confirmacion de eliminacion.
 *
 * Los decoradores @IsOptional/@IsString son CRITICOS: sin ellos, el
 * ValidationPipe global de NestJS rechaza el body con 400 Bad Request
 * cuando llegan propiedades que no estan declaradas (whitelist mode).
 */
class DeleteAllDataDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}

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

  /**
   * DELETE /user/all-data
   *
   * Borra todos los datos del usuario y hace soft delete del registro
   * principal (estado='ELIMINADO', nombre anonimizado, deleted_at).
   *
   * Body opcional: { motivo?: string }
   * - Si se provee, se guarda en delete_motivo para feedback del equipo.
   * - Si no se provee, el campo queda sin actualizar (no se guarda string vacio).
   *
   * Es el mismo use case que usa la landing /eliminar-cuenta, lo que garantiza
   * comportamiento consistente entre canales.
   */
  @Delete('all-data')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Eliminar cuenta y TODOS los datos del usuario (soft delete)',
  })
  @ApiBody({
    description: 'Motivo opcional de la eliminacion',
    required: false,
    schema: {
      type: 'object',
      properties: {
        motivo: { type: 'string', maxLength: 500, nullable: true },
      },
    },
  })
  @ApiOkResponse({ description: 'Datos eliminados y cuenta anonimizada.' })
  async deleteAllData(
    @Req() req: any,
    @Body() body: DeleteAllDataDto = {},
  ) {
    const motivo = body?.motivo?.trim();
    await this.deleteAllDataUseCase.execute(
      req.user.uid,
      motivo && motivo.length > 0 ? motivo : undefined,
    );
    return { message: 'Todos tus datos han sido eliminados.' };
  }
}