import type { IPaginationParams } from "@services/general";

/** Status of a deposit request */
export type DepositRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired";

/** Deposit request entity returned by the API */
export interface IDepositRequest {
  id: string;
  user_id: number;
  amount: number;
  reference_code: string;
  payment_method: string;
  attachment: string | null;
  attachment_url: string | null;
  status: DepositRequestStatus;
  reviewed_by: number | null;
  review_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  user: { id: number; name: string; email: string };
  reviewed_by_user: { id: number; name: string } | null;
  /** Alias: reviewer relation from API (snake_case of "reviewer()") */
  reviewer: { id: number; name: string } | null;
}

/** Query params for deposit requests list endpoint */
export interface IDepositRequestParams extends IPaginationParams {
  search?: string;
  status?: DepositRequestStatus;
  payment_method?: string;
}

/** Payload for updating deposit request status */
export interface IUpdateDepositStatusPayload {
  status: "approved" | "rejected";
  reason?: string;
}
