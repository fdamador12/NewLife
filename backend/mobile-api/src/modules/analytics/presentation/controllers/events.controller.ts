import { Body, Controller, HttpCode, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { TrackEventUseCase } from '../../application/use-cases/track-event.use-case';
import { TrackEventDto } from '../dtos/track-event.dto';

/**
 * Endpoint de ingesta de eventos de analytics.
 *
 * Diseño:
 * - Protegido con JwtAuthGuard → solo usuarios autenticados pueden trackear
 * - El user_id se extrae del JWT (req.user.uid), NO del cuerpo
 *   → imposible suplantar a otro usuario
 * - Devuelve 202 Accepted: el evento puede tardar en persistir, pero el cliente
 *   no necesita esperar. Si falla la persistencia se loggea pero no se devuelve error.
 */
@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly trackEventUseCase: TrackEventUseCase) {}

  @Post()
  @HttpCode(202) // Accepted — el evento entra a la cola de persistencia
  @ApiOperation({
    summary: 'Registra un evento de analytics del usuario autenticado',
    description:
      'El user_id se extrae automáticamente del JWT y se hashea antes de persistir. ' +
      'No es necesario (ni permitido) enviarlo en el body.',
  })
  async track(@Req() req: any, @Body() dto: TrackEventDto) {
    try {
      const result = await this.trackEventUseCase.execute({
        userId: req.user.uid,
        eventType: dto.event_type,
        sessionId: dto.session_id,
        appVersion: dto.app_version,
        properties: dto.properties,
      });

      return { success: true, event_id: result.event_id };
    } catch (error: any) {
      // Loggeamos pero no rompemos la experiencia del usuario por un evento de telemetría
      this.logger.warn(
        `Error trackeando ${dto.event_type}: ${error?.message ?? error}`,
      );

      // Si fue un BadRequest (event_type inválido), sí devolvemos el error
      // para que el cliente sepa que está mal su código.
      if (error?.status === 400) {
        throw error;
      }

      // Para otros errores (red, ROBLE caído), devolvemos 202 igual y loggeamos
      return { success: false, reason: 'persistence_error' };
    }
  }
}