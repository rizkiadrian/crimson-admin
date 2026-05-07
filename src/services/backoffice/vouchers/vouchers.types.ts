import type { IPaginationParams } from "@services/general";
import type { IServiceCategory } from "@services/backoffice/service-categories";

export type DiscountType =
  | "percentage"
  | "fixed_amount"
  | "free_service"
  | "commission_discount";
export type TargetUserType = "client" | "mitra" | "all";
export type DistributionType = "public_code" | "auto_assign" | "both";
export type SegmentType =
  | "new_user"
  | "verified_only"
  | "specific_users"
  | "all";
export type VoucherStatus = "active" | "inactive" | "expired" | "scheduled";

export interface IVoucher {
  id: number;
  code: string | null;
  name: string;
  description: string | null;
  discount_type: DiscountType;
  target_user_type: TargetUserType;
  discount_value: number;
  max_discount_cap: number | null;
  min_transaction_amount: number | null;
  service_category_id: number | null;
  quota: number | null;
  used_count: number;
  per_user_limit: number;
  distribution_type: DistributionType;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  /** Populated on detail endpoint — eager-loaded assigned users */
  users?: IVoucherUser[];
  /** Populated on detail endpoint — eager-loaded target segments */
  target_segments?: IVoucherTargetSegment[];
  /** Populated on detail endpoint — eager-loaded service category */
  service_category?: IServiceCategory | null;
}

export interface IVoucherUser {
  id: number;
  voucher_id: number;
  user_id: number;
  assigned_at: string | null;
  used_at: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
  /** Nested user relation (eager-loaded via users.user) */
  user?: IVoucherUserDetail;
}

/** Minimal user object nested inside VoucherUser */
export interface IVoucherUserDetail {
  id: number;
  name: string;
  email: string;
}

export interface IVoucherTargetSegment {
  id: number;
  voucher_id: number;
  segment_type: SegmentType;
  user_ids: number[] | null;
  created_at: string;
}

export interface IVoucherParams extends IPaginationParams {
  discount_type?: DiscountType;
  target_user_type?: TargetUserType;
  status?: VoucherStatus;
  search?: string;
}

/** Payload for creating a voucher */
export interface IVoucherCreatePayload {
  name: string;
  code?: string | null;
  description?: string | null;
  discount_type: DiscountType;
  target_user_type: TargetUserType;
  distribution_type: DistributionType;
  discount_value?: number;
  max_discount_cap?: number;
  min_transaction_amount?: number;
  service_category_id?: number;
  quota?: number | null;
  per_user_limit?: number | null;
  starts_at: string;
  expires_at: string;
  target_segments?: ITargetSegmentPayload[];
}

/** Payload for updating a voucher */
export interface IVoucherUpdatePayload {
  name: string;
  code?: string | null;
  description?: string | null;
  discount_type: DiscountType;
  target_user_type: TargetUserType;
  distribution_type: DistributionType;
  discount_value?: number;
  max_discount_cap?: number;
  min_transaction_amount?: number;
  service_category_id?: number;
  quota?: number | null;
  per_user_limit?: number | null;
  starts_at: string;
  expires_at: string;
  target_segments?: ITargetSegmentPayload[];
}

/** Payload for a single target segment in create/update */
export interface ITargetSegmentPayload {
  segment_type: SegmentType;
  user_ids?: number[] | null;
}

/** Payload for assigning voucher to users */
export interface IVoucherAssignPayload {
  user_ids: number[];
}
