import type { IPaginationParams } from "@services/general";

export type PopupContentType = "template" | "image" | "canvas" | "html";
export type PopupStatus = "draft" | "scheduled" | "active" | "paused" | "ended";
export type TriggerType =
  | "immediate"
  | "delay"
  | "scroll_depth"
  | "exit_intent"
  | "session_count"
  | "inactivity"
  | "event";
export type MetadataOperator =
  | "equals"
  | "not_equals"
  | "in"
  | "contains"
  | "exists";

export interface IMetadataCondition {
  field: string;
  operator: MetadataOperator;
  value: unknown;
}

export interface ITriggerRule {
  type: TriggerType;
  delay_seconds?: number;
  scroll_percent?: number;
  min_sessions?: number;
  idle_seconds?: number;
  event_key?: string;
  metadata_conditions?: IMetadataCondition[];
}

export interface ITriggerConfig {
  rules: ITriggerRule[];
  combine: "and";
}

export interface ITargetConfig {
  user_types?: string[];
  journey_stages?: string[];
  platforms?: string[];
  segment_ids?: number[];
  registered_within_days?: number;
}

export interface IScheduleConfig {
  start_date?: string;
  end_date?: string | null;
  time_window?: { start: string; end: string };
  days_of_week?: number[] | null;
}

export interface IFrequencyCap {
  max_per_day?: number | null;
  max_per_session?: number | null;
  max_lifetime?: number | null;
  cooldown_minutes?: number | null;
}

export interface ILinkedAction {
  type: string;
  value: string;
  attribution_window_hours?: number;
}

export interface IPopupPromotion {
  id: string;
  name: string;
  content_type: PopupContentType;
  content_config: Record<string, unknown> | null;
  status: PopupStatus;
  priority: number;
  trigger_config: ITriggerConfig | null;
  target_config: ITargetConfig | null;
  schedule_config: IScheduleConfig | null;
  frequency_cap: IFrequencyCap | null;
  linked_action: ILinkedAction | null;
  ab_variant: string | null;
  ab_group_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IPopupPromotionParams extends IPaginationParams {
  status?: PopupStatus;
  content_type?: PopupContentType;
  user_type?: string;
}

export interface IPopupPromotionCreatePayload {
  name: string;
  content_type: PopupContentType;
  content_config?: Record<string, unknown>;
  priority?: number;
  trigger_config?: ITriggerConfig;
  target_config?: ITargetConfig;
  schedule_config?: IScheduleConfig;
  frequency_cap?: IFrequencyCap;
  linked_action?: ILinkedAction;
}

export type IPopupPromotionUpdatePayload =
  Partial<IPopupPromotionCreatePayload>;

export interface IPopupAnalytics {
  impressions: number;
  clicks: number;
  dismissals: number;
  conversions: number;
  ctr: number;
  cvr: number;
  dismiss_rate: number;
}

export interface IPopupTimelineEntry {
  period: string;
  impressions: number;
  clicks: number;
  dismissals: number;
  conversions: number;
}

export interface IPopupBreakdownEntry {
  label: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface IPopupABVariant {
  popup_id: string;
  variant: string;
  name: string;
  impressions: number;
  clicks: number;
  dismissals: number;
  conversions: number;
  ctr: number;
  cvr: number;
  dismiss_rate: number;
}
