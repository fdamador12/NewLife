import { IsOptional, IsBoolean, IsInt, Min, Max, IsString } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  push_notifications_enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  preferred_reminder_hour?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(59)
  preferred_reminder_minute?: number | null;

  @IsOptional()
  @IsString()
  push_token?: string | null;
}