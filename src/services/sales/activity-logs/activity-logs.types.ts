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
  type?: string;
  status?: string;
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
  attachment_url: string | null;
  thumbnail_url: string | null;
  attachment_type: "image" | "file" | null;
  status: ActivityLogStatus;
  metadata: Record<string, unknown> | null;
  lead: IActivityLogLead | null;
  status_changed_by: number | null;
  status_change_reason: string | null;
  status_changed_at: string | null;
  status_changed_by_user: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
}

/** Payload type for creating an activity log */
export interface ICreateActivityLogPayload {
  lead_id?: string;
  type: ActivityLogType;
  title: string;
  description?: string;
  attachment?: File | null;
  metadata?: {
    requested_status?: string;
    requested_sales_id?: string;
  };
}

/** Query params for activity logs list endpoint */
export interface IActivityLogParams extends IPaginationParams {
  search?: string;
}
