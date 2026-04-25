import { IPaginationParams } from "@services/general";

// ─── Enums / Literal Types ───────────────────────────────────────────────────

export type LeadType = "client" | "mitra";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type LeadPriority = "low" | "medium" | "high" | "urgent";

// ─── Resource Interface ──────────────────────────────────────────────────────

export interface ILeadServiceCategory {
  id: number;
  name: string;
}

export interface ILead {
  id: number;
  type: LeadType;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  source: string;
  priority: LeadPriority;
  status: LeadStatus;
  notes: string | null;
  assigned_to: number | null;
  converted_user_id: number | null;
  service_category_id: number | null;
  contacted_at: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
  service_category: ILeadServiceCategory | null;
}

// ─── Payload Types ───────────────────────────────────────────────────────────

export interface ILeadCreatePayload {
  type: LeadType;
  name: string;
  source: string;
  email?: string;
  phone?: string;
  address?: string;
  priority?: LeadPriority;
  status?: LeadStatus;
  notes?: string;
  assigned_to?: number | null;
  service_category_id?: number | null;
}

export interface ILeadUpdatePayload {
  type?: LeadType;
  name?: string;
  source?: string;
  email?: string;
  phone?: string;
  address?: string;
  priority?: LeadPriority;
  status?: LeadStatus;
  notes?: string;
  assigned_to?: number | null;
  service_category_id?: number | null;
}

export interface ILeadUpdateStatusPayload {
  status: LeadStatus;
}

export interface ILeadConvertPayload {
  converted_user_id: number;
}

// ─── Query Params ────────────────────────────────────────────────────────────

export interface ILeadParams extends IPaginationParams {
  type?: LeadType;
  status?: LeadStatus;
  priority?: LeadPriority;
}
