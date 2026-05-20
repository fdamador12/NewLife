import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../admin/presentation/guards/admin-jwt.guard';

// Use cases
import { GetOverviewMetricsUseCase, OverviewMetricsResult } from '../../application/use-cases/get-overview-metrics.use-case';
import { GetDailyEventsUseCase, DailyEventsResult } from '../../application/use-cases/get-daily-events.use-case';
import { GetCheckinFunnelUseCase, CheckinFunnelResult } from '../../application/use-cases/get-checkin-funnel.use-case';
import { GetSosStatsUseCase, SosStatsResult } from '../../application/use-cases/get-sos-stats.use-case';
import { GetTopContentUseCase, TopContentResult } from '../../application/use-cases/get-top-content.use-case';
import { GetTopPhrasesUseCase, TopPhrasesResult } from '../../application/use-cases/get-top-phrases.use-case';
import { GetLevelDistributionUseCase, LevelDistributionResult } from '../../application/use-cases/get-level-distribution.use-case';
import { GetActivityByHourUseCase, ActivityByHourResult } from '../../application/use-cases/get-activity-by-hour.use-case';
import { GetEventsListUseCase, ListEventsResult } from '../../application/use-cases/get-events-list.use-case';

// DTOs
import { AnalyticsDateRangeDto, DailyEventsQueryDto, TopItemsQueryDto } from '../dtos/analytics-query.dto';
import { EventsListQueryDto } from '../dtos/events-list-query.dto';

/**
 * Controlador de metricas del dashboard admin.
 * Todos los endpoints requieren autenticacion de admin via JWT.
 *
 * Cache de 5 min en el adapter optimiza llamadas frecuentes.
 *
 * Endpoints con rango temporal aceptan ?from=&to= (ISO 8601).
 * Default: ultimos 30 dias.
 *
 * Endpoints sin rango temporal (overview, level-distribution) calculan
 * sobre el historial completo.
 */
@ApiTags('Admin — Analytics')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('api/web/analytics')
export class AnalyticsController {
  constructor(
    private readonly getOverviewMetricsUseCase: GetOverviewMetricsUseCase,
    private readonly getDailyEventsUseCase: GetDailyEventsUseCase,
    private readonly getCheckinFunnelUseCase: GetCheckinFunnelUseCase,
    private readonly getSosStatsUseCase: GetSosStatsUseCase,
    private readonly getTopContentUseCase: GetTopContentUseCase,
    private readonly getTopPhrasesUseCase: GetTopPhrasesUseCase,
    private readonly getLevelDistributionUseCase: GetLevelDistributionUseCase,
    private readonly getActivityByHourUseCase: GetActivityByHourUseCase,
    private readonly getEventsListUseCase: GetEventsListUseCase,
  ) {}

  // ── GET /api/web/analytics/overview ─────────────────────────────────────
  @Get('overview')
  @ApiOperation({
    summary: 'KPIs principales para las cards del dashboard',
    description:
      'Devuelve usuarios activos (hoy/semana/mes), check-ins de hoy, ' +
      'SOS de hoy y totales historicos. Datos cacheados 5 min.',
  })
  @ApiOkResponse({ description: 'Metricas de overview calculadas exitosamente.' })
  async getOverview(): Promise<OverviewMetricsResult> {
    return this.getOverviewMetricsUseCase.execute();
  }

  // ── GET /api/web/analytics/daily-events ─────────────────────────────────
  @Get('daily-events')
  @ApiOperation({
    summary: 'Serie temporal de eventos por dia (para grafico de lineas)',
    description:
      'Devuelve un array con un bucket por dia en el rango, incluyendo ' +
      'dias sin eventos (total=0). Permite filtrar por categoria.',
  })
  @ApiOkResponse({ description: 'Serie temporal generada exitosamente.' })
  async getDailyEvents(@Query() query: DailyEventsQueryDto): Promise<DailyEventsResult> {
    return this.getDailyEventsUseCase.execute({
      from: query.from,
      to: query.to,
      category: query.category,
    });
  }

  // ── GET /api/web/analytics/checkin-funnel ───────────────────────────────
  @Get('checkin-funnel')
  @ApiOperation({
    summary: 'Funnel del check-in diario (iniciados vs completados vs abandonados)',
    description:
      'Muestra cuantos usuarios completaron el check-in vs abandonaron. ' +
      'Util para detectar friccion en el flujo.',
  })
  @ApiOkResponse({ description: 'Funnel calculado exitosamente.' })
  async getCheckinFunnel(@Query() query: AnalyticsDateRangeDto): Promise<CheckinFunnelResult> {
    return this.getCheckinFunnelUseCase.execute({
      from: query.from,
      to: query.to,
    });
  }

  // ── GET /api/web/analytics/sos-stats ────────────────────────────────────
  @Get('sos-stats')
  @ApiOperation({
    summary: 'Estadisticas del boton SOS',
    description:
      'Total de activaciones, usuarios unicos, opciones mas seleccionadas ' +
      'y distribucion diaria. Critico para el equipo de salud mental.',
  })
  @ApiOkResponse({ description: 'Estadisticas de SOS calculadas exitosamente.' })
  async getSosStats(@Query() query: AnalyticsDateRangeDto): Promise<SosStatsResult> {
    return this.getSosStatsUseCase.execute({
      from: query.from,
      to: query.to,
    });
  }

  // ── GET /api/web/analytics/top-content ──────────────────────────────────
  @Get('top-content')
  @ApiOperation({
    summary: 'Top contenidos mas vistos',
    description:
      'Lista los contenidos educativos mas vistos en el rango. ' +
      'Incluye titulo y tipo (ARTICULO/VIDEO) resueltos desde la base.',
  })
  @ApiOkResponse({ description: 'Top de contenidos calculado exitosamente.' })
  async getTopContent(@Query() query: TopItemsQueryDto): Promise<TopContentResult> {
    return this.getTopContentUseCase.execute({
      from: query.from,
      to: query.to,
      limit: query.limit,
    });
  }

  // ── GET /api/web/analytics/top-phrases ──────────────────────────────────
  @Get('top-phrases')
  @ApiOperation({
    summary: 'Top frases mas favoriteadas',
    description:
      'Lista las frases mas favoriteadas en el rango. ' +
      'Incluye el texto de la frase resuelto desde la base.',
  })
  @ApiOkResponse({ description: 'Top de frases calculado exitosamente.' })
  async getTopPhrases(@Query() query: TopItemsQueryDto): Promise<TopPhrasesResult> {
    return this.getTopPhrasesUseCase.execute({
      from: query.from,
      to: query.to,
      limit: query.limit,
    });
  }

  // ── GET /api/web/analytics/level-distribution ───────────────────────────
  @Get('level-distribution')
  @ApiOperation({
    summary: 'Distribucion de usuarios en el programa de 12 pasos',
    description:
      'Matriz 12 x 3 con usuarios trabajando en cada (nivel, sublevel). ' +
      'Tambien resumen por nivel y el nivel mas alto alcanzado. ' +
      'Calcula sobre todo el historial (sin rango de fechas).',
  })
  @ApiOkResponse({ description: 'Distribucion calculada exitosamente.' })
  async getLevelDistribution(): Promise<LevelDistributionResult> {
    return this.getLevelDistributionUseCase.execute();
  }

  // ── GET /api/web/analytics/activity-by-hour ─────────────────────────────
  @Get('activity-by-hour')
  @ApiOperation({
    summary: 'Distribucion de actividad por hora del dia (0-23)',
    description:
      'Cuantos eventos hay en cada hora del dia, sumados a lo largo ' +
      'del rango. Util para identificar horas pico de uso y crisis.',
  })
  @ApiOkResponse({ description: 'Actividad por hora calculada exitosamente.' })
  async getActivityByHour(@Query() query: AnalyticsDateRangeDto): Promise<ActivityByHourResult> {
    return this.getActivityByHourUseCase.execute({
      from: query.from,
      to: query.to,
    });
  }

  // ── GET /api/web/analytics/events ───────────────────────────────────────
  @Get('events')
  @ApiOperation({
    summary: 'Lista paginada de eventos para la tabla del dashboard',
    description:
      'Lista cronologica (DESC) de eventos con filtros opcionales: ' +
      'rango de fechas, tipo de evento, categoria, usuario especifico. ' +
      'Paginacion via limit (max 100) y offset.',
  })
  @ApiOkResponse({ description: 'Lista de eventos obtenida exitosamente.' })
  async getEvents(@Query() query: EventsListQueryDto): Promise<ListEventsResult> {
    return this.getEventsListUseCase.execute({
      from: query.from,
      to: query.to,
      limit: query.limit,
      offset: query.offset,
      eventType: query.event_type,
      category: query.category,
      userHash: query.user_hash,
    });
  }
}