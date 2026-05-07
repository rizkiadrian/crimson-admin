import type { IPaginationParams } from "@services/general";

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
  /** Populated on detail endpoint — eager-loaded assigned users */
  users?: IVoucherUser[];
}

export interface IVoucherUser {
  id: number;
  voucher_id: number;
  user_id: number;
  user_name: string;
  assigned_at: string;
  used_at: string | null;
  usage_count: number;
}

export interface IVoucherTargetSegment {
  id: number;
  voucher_id: number;
  segment_type: SegmentType;
  user_ids: number[] | null;
}

export interface IVoucherParams extends IPaginationParams {
  discount_type?: DiscountType;
  target_user_type?: TargetUserType;
  is_active?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}
