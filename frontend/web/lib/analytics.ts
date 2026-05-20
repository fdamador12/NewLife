import api from './axios';

// ─── Tipos compartidos ────────────────────────────────────────────────────

export interface DateRangeFilter {
  from?: string;
  to?: string;
}

export interface RangeMeta {
  from: string;
  to: string;
}

// ─── 1. Overview ──────────────────────────────────────────────────────────

export interface OverviewMetrics {
  active_users_today: number;
  active_users_week: number;
  active_users_month: number;
  checkins_today: number;
  sos_triggered_today: number;
  total_events: number;
  total_users: number;
}

export async function getOverview(): Promise<OverviewMetrics> {
  const res = await api.get('/api/web/analytics/overview');
  return res.data;
}

// ─── 2. Daily Events ──────────────────────────────────────────────────────

export type EventCategory =
  | 'session'
  | 'navigation'
  | 'crisis'
  | 'content'
  | 'care'
  | 'gamification'
  | 'progress';

export interface DailyEventsBucket {
  date: string;
  total: number;
  unique_users: number;
}

export interface DailyEventsResult {
  buckets: DailyEventsBucket[];
  range: RangeMeta & { days: number };
}

export interface DailyEventsFilter extends DateRangeFilter {
  category?: EventCategory;
}

export async function getDailyEvents(filter: DailyEventsFilter = {}): Promise<DailyEventsResult> {
  const res = await api.get('/api/web/analytics/daily-events', { params: filter });
  return res.data;
}

// ─── 3. Checkin Funnel ────────────────────────────────────────────────────

export interface CheckinFunnelResult {
  started: number;
  completed: number;
  abandoned: number;
  completion_rate: number;
  abandonment_rate: number;
  range: RangeMeta;
}

export async function getCheckinFunnel(filter: DateRangeFilter = {}): Promise<CheckinFunnelResult> {
  const res = await api.get('/api/web/analytics/checkin-funnel', { params: filter });
  return res.data;
}

// ─── 4. SOS Stats ─────────────────────────────────────────────────────────

export interface SosOptionUsage {
  option: string;
  count: number;
}

export interface SosDailyBucket {
  date: string;
  count: number;
}

export interface SosStatsResult {
  total_triggers: number;
  unique_users: number;
  options_breakdown: SosOptionUsage[];
  daily_breakdown: SosDailyBucket[];
  range: RangeMeta;
}

export async function getSosStats(filter: DateRangeFilter = {}): Promise<SosStatsResult> {
  const res = await api.get('/api/web/analytics/sos-stats', { params: filter });
  return res.data;
}

// ─── 5. Top Content ───────────────────────────────────────────────────────

export interface TopContentItem {
  content_id: string;
  title: string | null;
  type: string | null;
  views: number;
  unique_users: number;
}

export interface TopContentResult {
  items: TopContentItem[];
  total_views: number;
  range: RangeMeta;
}

export interface TopItemsFilter extends DateRangeFilter {
  limit?: number;
}

export async function getTopContent(filter: TopItemsFilter = {}): Promise<TopContentResult> {
  const res = await api.get('/api/web/analytics/top-content', { params: filter });
  return res.data;
}

// ─── 6. Top Phrases ───────────────────────────────────────────────────────

export interface TopPhraseItem {
  phrase_id: string;
  text: string | null;
  favorites: number;
  unique_users: number;
}

export interface TopPhrasesResult {
  items: TopPhraseItem[];
  total_favorites: number;
  range: RangeMeta;
}

export async function getTopPhrases(filter: TopItemsFilter = {}): Promise<TopPhrasesResult> {
  const res = await api.get('/api/web/analytics/top-phrases', { params: filter });
  return res.data;
}

// ─── 7. Level Distribution ────────────────────────────────────────────────

export interface LevelCell {
  level: number;
  sublevel: number;
  users_in_progress: number;
  users_completed: number;
}

export interface LevelSummary {
  level: number;
  users_reached: number;
  users_completed: number;
}

export interface LevelDistributionResult {
  matrix: LevelCell[];
  by_level: LevelSummary[];
  total_users_with_progress: number;
  highest_level_reached: number;
}

export async function getLevelDistribution(): Promise<LevelDistributionResult> {
  const res = await api.get('/api/web/analytics/level-distribution');
  return res.data;
}

// ─── 8. Activity by Hour ──────────────────────────────────────────────────

export interface HourBucket {
  hour: number;
  events: number;
  unique_users: number;
}

export interface ActivityByHourResult {
  hourly: HourBucket[];
  /** Horas con el valor maximo (puede haber empates). */
  peak_hours: number[];
  /** Cantidad de eventos en cada peak_hour. */
  peak_value: number;
  /** Horas con menor actividad EXCLUYENDO ceros (puede haber empates). */
  lowest_hours: number[];
  /** Cantidad de eventos en cada lowest_hour. */
  lowest_value: number;
  total_events: number;
  range: RangeMeta;
}

export async function getActivityByHour(filter: DateRangeFilter = {}): Promise<ActivityByHourResult> {
  const res = await api.get('/api/web/analytics/activity-by-hour', { params: filter });
  return res.data;
}

// ─── 9. Events List ───────────────────────────────────────────────────────

export interface EventListItem {
  event_id: string;
  user_id_short: string;
  user_id_hash: string;
  event_type: string;
  category: string;
  properties: Record<string, any> | null;
  created_at: string;
}

export interface PaginationMeta {
  limit: number;
  offset: number;
  total: number;
  has_more: boolean;
}

export interface EventsListResult {
  items: EventListItem[];
  pagination: PaginationMeta;
  range: RangeMeta;
}

export interface EventsListFilter extends DateRangeFilter {
  limit?: number;
  offset?: number;
  event_type?: string;
  category?: EventCategory;
  user_hash?: string;
}

export async function getEventsList(filter: EventsListFilter = {}): Promise<EventsListResult> {
  const res = await api.get('/api/web/analytics/events', { params: filter });
  return res.data;
}