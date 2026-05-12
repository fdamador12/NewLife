import { IsString, IsEnum, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChallengeDifficulty, ChallengeType } from '../../../motivation/domain/entities/challenge.entity';

export class CreateChallengeDto {
  @ApiProperty({ example: 'Primera semana sin consumo' })
  @IsString()
  titulo!: string;

  @ApiProperty({ example: 'Completa 7 días seguidos sin consumir...' })
  @IsString()
  descripcion!: string;

  @ApiProperty({ enum: ChallengeDifficulty, example: ChallengeDifficulty.INTENSA })
  @IsEnum(ChallengeDifficulty)
  dificultad!: ChallengeDifficulty;

  @ApiProperty({ enum: ChallengeType, example: ChallengeType.SOBRIETY_DAYS })
  @IsEnum(ChallengeType)
  tipo!: ChallengeType;

  @ApiProperty({ description: 'La meta numérica del reto', example: 7 })
  @IsInt()
  @Min(1)
  target!: number;
}

export class UpdateChallengeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() titulo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional({ enum: ChallengeDifficulty }) @IsOptional() @IsEnum(ChallengeDifficulty) dificultad?: ChallengeDifficulty;
  @ApiPropertyOptional({ enum: ChallengeType }) @IsOptional() @IsEnum(ChallengeType) tipo?: ChallengeType;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) target?: number;
}