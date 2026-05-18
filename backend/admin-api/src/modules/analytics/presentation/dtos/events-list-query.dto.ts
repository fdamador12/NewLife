import { IsOptional, IsString, IsISO8601, IsEnum, IsInt, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AnalyticsDateRangeDto, EventCategoryEnum } from './analytics-query.dto';

/**
 * DTO de query para el endpoint GET /analytics/events (lista paginada).
 * Permite paginar, filtrar por tipo de evento, categoria y usuario especifico.
 */
export class EventsListQueryDto extends AnalyticsDateRangeDto {
  @ApiPropertyOptional({
    description: 'Cantidad de eventos por pagina (1-100). Default: 50.',
    example: 50,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un numero entero' })
  @Min(1, { message: 'limit debe ser >= 1' })
  @Max(100, { message: 'limit debe ser <= 100' })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Offset para paginacion. Default: 0.',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'offset debe ser un numero entero' })
  @Min(0, { message: 'offset debe ser >= 0' })
  offset?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de evento especifico (ej: sos_triggered)',
    example: 'sos_triggered',
  })
  @IsOptional()
  @IsString()
  event_type?: string;

  @ApiPropertyOptional({
    enum: EventCategoryEnum,
    description: 'Filtrar por categoria',
    example: EventCategoryEnum.CRISIS,
  })
  @IsOptional()
  @IsEnum(EventCategoryEnum, { message: 'Categoria invalida' })
  category?: EventCategoryEnum;

  @ApiPropertyOptional({
    description: 'Filtrar por user_id_hash especifico (para drill-down)',
    example: 'abc123def456...',
  })
  @IsOptional()
  @IsString()
  user_hash?: string;
}