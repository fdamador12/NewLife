import { Body, Controller, Get, Query, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { DailyCheckinUseCase } from '../../application/use-cases/daily-checkin.use-case';
import { GratitudeHistoryUseCase } from '../../application/use-cases/gratitude-history.use-case';
import { DailyCheckinDto } from '../dtos/daily-checkin.dto';
import { AdvanceCaminoUseCase } from '../../application/use-cases/advance-camino.use-case';
import { GetCaminoUseCase } from '../../application/use-cases/get-camino.use-case';
import { ProgressSummaryUseCase } from '../../application/use-cases/progress-summary.use-case';
import { GetTodayCheckinUseCase } from '../../application/use-cases/get-today-checkin.use-case';
import { GetCalendarUseCase } from '../../application/use-cases/get-calendar.use-case';
import { GetRiskChartsUseCase } from '../../application/use-cases/get-risk-charts.use-case';
import { GetSobrietyTimeUseCase } from '../../application/use-cases/get-sobriety-time.use-case';
import { InitCaminoUseCase } from '../../application/use-cases/init-camino.use-case';
import { InitSobrietyUseCase } from '../../application/use-cases/init-sobriety.use-case';
import { GetAllRegistrosDiarioUseCase } from '../../application/use-cases/get-all-registros-diario.use-case';
import { Logger } from '@nestjs/common';
import { GetConsumptionDatesUseCase } from '../../application/use-cases/get-consumption-dates.use-case';
import { GetAhorroUseCase } from '../../application/use-cases/get-ahorro.use-case';

@ApiTags('Progress')
@ApiBearerAuth()
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  private readonly logger = new Logger(ProgressController.name);

  constructor(
    private readonly dailyCheckinUseCase: DailyCheckinUseCase,
    private readonly gratitudeHistoryUseCase: GratitudeHistoryUseCase,
    private readonly advanceCaminoUseCase: AdvanceCaminoUseCase,
    private readonly getCaminoUseCase: GetCaminoUseCase,
    private readonly progressSummaryUseCase: ProgressSummaryUseCase,
    private readonly getTodayCheckinUseCase: GetTodayCheckinUseCase,
    private readonly getCalendarUseCase: GetCalendarUseCase,
    private readonly getRiskChartsUseCase: GetRiskChartsUseCase,
    private readonly getSobrietyTimeUseCase: GetSobrietyTimeUseCase,
    private readonly initCaminoUseCase: InitCaminoUseCase,
    private readonly initSobrietyUseCase: InitSobrietyUseCase,
    private readonly getAllRegistrosDiarioUseCase: GetAllRegistrosDiarioUseCase,
    private readonly getConsumptionDatesUseCase: GetConsumptionDatesUseCase,
    private readonly getAhorroUseCase: GetAhorroUseCase,
  ) { }

  @Post('init')
  @ApiOperation({ summary: 'Inicializa/verifica registro en camino del usuario' })
  async initCamino(@Req() req) {
    const masterToken = req.headers.authorization.split(' ')[1];
    return this.initCaminoUseCase.execute(req.user.uid, masterToken);
  }

  @Post('init-sobriety')
  @ApiOperation({ summary: 'Inicializa fecha de sobriedad (al registrarse)' })
  async initSobriety(@Req() req, @Body() body: { fecha_ultimo_consumo: string }) {
    const masterToken = req.headers.authorization.split(' ')[1];
    return this.initSobrietyUseCase.execute(req.user.uid, body.fecha_ultimo_consumo, masterToken);
  }

  @Post('daily-checkin')
  async dailyCheckin(@Req() req, @Body() dto: DailyCheckinDto) {
    try {
      console.log('📤 Body recibido:', dto);

      const ahora = new Date();
      const fechaUTC5 = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));

      const dataWithTimezone = {
        ...dto,
        fecha: fechaUTC5.toISOString().slice(0, 19) + '-05:00',
      };

      console.log('📤 Data con timezone:', dataWithTimezone);

      const userToken = req.headers.authorization.split(' ')[1];
      return this.dailyCheckinUseCase.execute(req.user.uid, dataWithTimezone, userToken);
    } catch (error) {
      this.logger.error('Error guardando daily checkin:', error);
      throw error;
    }
  }

  @Get('gratitude-history')
  @ApiOperation({ summary: 'Historial de gratitud del usuario' })
  async gratitudeHistory(@Req() req) {
    const userToken = req.headers.authorization.split(' ')[1];
    return this.gratitudeHistoryUseCase.execute(req.user.uid, userToken);
  }

  @Post('camino/advance')
  @ApiOperation({ summary: 'Avanza al siguiente subnivel/nivel en los 12 pasos' })
  async advanceCamino(@Req() req, @Body() body: { nivel: number; subnivel: number }) {
    const userToken = req.headers.authorization.split(' ')[1];
    return this.advanceCaminoUseCase.execute(req.user.uid, userToken, body.nivel, body.subnivel);
  }

  @Get('camino')
  @ApiOperation({ summary: 'Retorna el nivel y subnivel actual del usuario' })
  async getCamino(@Req() req) {
    return this.getCaminoUseCase.execute(req.user.uid);
  }

  @Get('sobriety-time')
  @ApiOperation({ summary: 'Obtiene el tiempo sobrio actual del usuario' })
  async getSobrietyTime(@Req() req) {
    return this.getSobrietyTimeUseCase.execute(req.user.uid);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumen de progreso del usuario (ánimo, sobriedad, detonantes)' })
  async progressSummary(@Req() req) {
    const userToken = req.headers.authorization.split(' ')[1];
    return this.progressSummaryUseCase.execute(req.user.uid, userToken);
  }

  @Get('daily-checkin/today')
  @ApiOperation({ summary: 'Retorna el registro diario de hoy si existe, null si no' })
  async getTodayCheckin(@Req() req) {
    const userToken = req.headers.authorization.split(' ')[1];
    return this.getTodayCheckinUseCase.execute(req.user.uid, userToken);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Calendario de sobriedad por mes' })
  async getCalendar(
    @Req() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const userToken = req.headers.authorization.split(' ')[1];
    return this.getCalendarUseCase.execute(
      req.user.uid,
      parseInt(month),
      parseInt(year),
      userToken,
    );
  }

  @Get('risk-charts')
  @ApiOperation({ summary: 'Datos para las gráficas de riesgo' })
  async getRiskCharts(@Req() req) {
    const userToken = req.headers.authorization.split(' ')[1];
    return this.getRiskChartsUseCase.execute(req.user.uid, userToken);
  }

  @Get('daily-checkin/all')
  @ApiOperation({ summary: 'Obtener todos los registros diarios del usuario' })
  async getAllRegistros(@Req() req: any) {
    try {
      const usuarioId = req.user.uid;
      const token = req.headers.authorization?.split(' ')[1];
      const registros = await this.getAllRegistrosDiarioUseCase.execute(usuarioId, token);
      return { registros, total: registros.length };
    } catch (error) {
      this.logger.error('Error obteniendo registros:', error);
      throw error;
    }
  }

  @Get('daily-checkin/consumption-dates')
  @ApiOperation({ summary: 'Obtener fechas y estado de consumo del usuario' })
  async getConsumptionDates(@Req() req: any) {
    try {
      const usuarioId = req.user.uid;
      const token = req.headers.authorization?.split(' ')[1];
      const registros = await this.getConsumptionDatesUseCase.execute(usuarioId, token);
      return { registros, total: registros.length };
    } catch (error) {
      this.logger.error('Error obteniendo fechas de consumo:', error);
      throw error;
    }
  }

  @Get('ahorro')
  @ApiOperation({ summary: 'Obtiene el ahorro acumulado del usuario' })
  async getAhorro(@Req() req: any) {
    try {
      const userToken = req.headers.authorization?.split(' ')[1];
      return await this.getAhorroUseCase.execute(req.user.uid, userToken);
    } catch (error) {
      this.logger.error('Error obteniendo ahorro:', error);
      throw error;
    }
  }
}