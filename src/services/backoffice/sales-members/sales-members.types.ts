import { IPaginationParams } from "@services/general";

// ─── Resource Interface ──────────────────────────────────────────────────────

export interface ISalesUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  sales_id: string;
  role_name: string;
  created_at: string;
  updated_at: string;
}

/** Lightweight item for dropdown use (from /sales-members-list endpoint) */
export interface ISalesListItem {
  id: number;
  name: string;
  sales_id: string;
  email: string;
}

// ─── Payload Types ───────────────────────────────────────────────────────────

export interface ISalesCreatePayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface ISalesUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

// ─── Query Params ────────────────────────────────────────────────────────────

export type ISalesUserParams = IPaginationParams;
