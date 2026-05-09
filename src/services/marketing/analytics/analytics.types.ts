import type { IPaginationParams } from "@services/general";

// ─── Funnel Stats ────────────────────────────────────────────────────────────

export interface IStageCount {
  stage: string;
  count: number;
}

export interface IConversionRate {
  from_stage: string;
  to_stage: string;
  rate: number;
}

export interface IStageTime {
  stage: string;
  average_hours: number;
}

export interface IFunnelStats {
  stages: IStageCount[];
  conversions: IConversionRate[];
  average_time: IStageTime[];
}

// ─── Funnel Trends ───────────────────────────────────────────────────────────

export interface IFunnelTrendSeries {
  stage: string;
  data: number[];
}

export interface IFunnelTrends {
  labels: string[];
  series: IFunnelTrendSeries[];
}

// ─── Funnel Params ───────────────────────────────────────────────────────────

export interface IFunnelParams {
  period?: "7d" | "30d" | "90d" | "custom";
  date_from?: string;
  date_to?: string;
  granularity?: "daily" | "weekly";
}

// ─── Segments ────────────────────────────────────────────────────────────────

export interface ISegmentSummary {
  stages: IStageCount[];
  total: number;
}

export interface ISegmentUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  journey_stage: string;
  created_at: string;
  last_event_at: string | null;
}

export interface ISegmentUsersParams extends IPaginationParams {
  stage: string;
  registration_date_from?: string;
  registration_date_to?: string;
  last_active_from?: string;
  last_active_to?: string;
}

// ─── Event Log ───────────────────────────────────────────────────────────────

export interface IUserEvent {
  id: number;
  user: { id: number; name: string; email: string };
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface IEventLogParams extends IPaginationParams {
  event_type?: string;
  user_id?: number;
  date_from?: string;
  date_to?: string;
}

// ─── Journey Summary (Dashboard Widget) ──────────────────────────────────────

export interface IJourneySummary {
  stages: IStageCount[];
  conversion_rate: number;
}
