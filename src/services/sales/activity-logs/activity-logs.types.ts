import type { IPaginationParams } from "@services/general";

/** Activity log type enum matching backend constants */
export type ActivityLogType =
  | "general_note"
  | "request_lead_assign"
  | "request_update_lead_status";

/** Activity log status enum matching backend constants */
export type ActivityLogStatus = "pending" | "approved" | "rejected";

/** Lead info embedded in activity log response */
export interface IActivityLogLead {
  id: number;
  name: string;
  lead_id: string;
}

/** Single activity log item from GET /sales/activity-logs */
export interface IActivityLog {
  id: number;
  user_id: number;
  lead_id: number | null;
  type: ActivityLogType;
  title: string;
  description: string | null;
  attachment: string | null;
  status: ActivityLogStatus;
  metadata: Record<string, unknown> | null;
  lead: IActivityLogLead | null;
  created_at: string;
  updated_at: string;
}

/** Query params for activity logs list endpoint */
export interface IActivityLogParams extends IPaginationParams {
  search?: string;
}
