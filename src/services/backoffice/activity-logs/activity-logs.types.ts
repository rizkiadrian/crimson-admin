import type { IPaginationParams } from "@services/general";
import type {
  IActivityLog,
  ActivityLogStatus,
  ActivityLogType,
} from "@services/sales/activity-logs";

/** Backoffice activity log extends sales activity log with user + reviewer info */
export interface IBackofficeActivityLog extends IActivityLog {
  user: { id: number; name: string };
  status_changed_by_user: { id: number; name: string } | null;
  status_change_reason: string | null;
  status_changed_at: string | null;
}

/** Query params for backoffice activity logs list endpoint */
export interface IBackofficeActivityLogParams extends IPaginationParams {
  search?: string;
  status?: ActivityLogStatus;
  type?: ActivityLogType;
}

/** Payload for updating activity log status */
export interface IUpdateStatusPayload {
  status: "approved" | "rejected";
  reason: string;
  comment?: string;
}
