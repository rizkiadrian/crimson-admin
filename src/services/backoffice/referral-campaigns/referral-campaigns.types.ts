import type { IPaginationParams } from "@services/general";

// --- Enums / Union Types ---

export type ReferralCampaignStatus = "draft" | "active" | "paused" | "ended";
export type TargetRole = "client" | "mitra";
export type RewardType = "cashback" | "voucher" | "none";
export type ReferralStatus = "pending" | "completed" | "expired" | "flagged";
export type RewardStatus = "pending" | "disbursed" | "failed";
export type RecipientType = "referrer" | "referee";

// --- Interfaces ---

export interface IReferralTier {
  id: number;
  campaign_id: number;
  name: string;
  icon: string | null;
  min_referrals: number;
  max_referrals: number | null;
  bonus_percentage: number;
  extra_perks: Record<string, unknown>[] | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface IReferralMilestone {
  id: number;
  campaign_id: number;
  name: string;
  event_type: string;
  sort_order: number;
  referrer_reward_type: RewardType;
  referrer_reward_amount: number | null;
  referrer_voucher_id: number | null;
  referee_reward_type: RewardType;
  referee_reward_amount: number | null;
  referee_voucher_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface IReferralCampaign {
  id: number;
  name: string;
  description: string | null;
  target_role: TargetRole;
  status: ReferralCampaignStatus;
  starts_at: string;
  ends_at: string | null;
  max_referrals_per_user: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IReferralCampaignDetail extends IReferralCampaign {
  milestones: IReferralMilestone[];
  tiers: IReferralTier[];
}

export interface IReferralCode {
  id: number;
  user_id: number;
  campaign_id: number;
  code: string;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- Params ---

export interface IReferralCampaignParams extends IPaginationParams {
  status?: ReferralCampaignStatus;
  target_role?: TargetRole;
}

// --- Payloads ---

export interface IReferralMilestonePayload {
  name: string;
  event_type: string;
  sort_order: number;
  referrer_reward_type: RewardType;
  referrer_reward_amount?: number | null;
  referrer_voucher_id?: number | null;
  referee_reward_type: RewardType;
  referee_reward_amount?: number | null;
  referee_voucher_id?: number | null;
}

export interface IReferralTierPayload {
  name: string;
  icon?: string | null;
  min_referrals: number;
  max_referrals?: number | null;
  bonus_percentage: number;
  extra_perks?: Record<string, unknown>[] | null;
  sort_order: number;
}

export interface IReferralCampaignCreatePayload {
  name: string;
  description?: string | null;
  target_role: TargetRole;
  starts_at: string;
  ends_at?: string | null;
  max_referrals_per_user?: number | null;
  milestones: IReferralMilestonePayload[];
  tiers?: IReferralTierPayload[];
}

export interface IReferralCampaignUpdatePayload {
  name?: string;
  description?: string | null;
  target_role?: TargetRole;
  starts_at?: string;
  ends_at?: string | null;
  max_referrals_per_user?: number | null;
  milestones?: IReferralMilestonePayload[];
  tiers?: IReferralTierPayload[];
}
