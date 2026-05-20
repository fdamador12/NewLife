import { IsOptional, IsString, IsISO8601, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de query params para endpoints de analytics que filtran por rango
 * de fechas. Si NO se envia, los use cases usan default de 30 dias.
 *
 * Las fechas se reciben como ISO 8601 (ej: "2026-05-01" o
 * "2026-05-01T00:00:00.000Z").
 */
export class AnalyticsDateRangeDto {
  @ApiPropertyOptional({
    description: 'Fecha desde (ISO 8601). Default: hace 30 dias.',
    example: '2026-04-18',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'from debe ser una fecha ISO 8601 valida' })
  from?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (ISO 8601). Default: ahora.',
    example: '2026-05-18',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'to debe ser una fecha ISO 8601 valida' })
  to?: string;
}

/**
 * Categorias validas para filtrar eventos.
 */
export enum EventCategoryEnum {
  SESSION = 'session',
  NAVIGATION = 'navigation',
  CRISIS = 'crisis',
  CONTENT = 'content',
  CARE = 'care',
  GAMIFICATION = 'gamification',
  PROGRESS = 'progress',
}

/**
 * DTO de query para daily-events. Extiende el rango + filtro de categoria.
 */
export class DailyEventsQueryDto extends AnalyticsDateRangeDto {
  @ApiPropertyOptional({
    enum: EventCategoryEnum,
    description: 'Filtrar por categoria. Si no se envia, devuelve TODOS los eventos.',
    example: EventCategoryEnum.CRISIS,
  })
  @IsOptional()
  @IsEnum(EventCategoryEnum, { message: 'Categoria invalida' })
  category?: EventCategoryEnum;
}

/**
 * DTO de query para top-content y top-phrases. Extiende rango + limit.
 */
export class TopItemsQueryDto extends AnalyticsDateRangeDto {
  @ApiPropertyOptional({
    description: 'Cantidad maxima de items en el top (1-50). Default: 10.',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un numero entero' })
  @Min(1, { message: 'limit debe ser >= 1' })
  @Max(50, { message: 'limit debe ser <= 50' })
  limit?: number;
}