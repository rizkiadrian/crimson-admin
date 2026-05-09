import type { IPaginationParams } from "@services/general";
import type {
  ReferralStatus,
  RewardStatus,
  RewardType,
  RecipientType,
} from "@services/marketing/referral-campaigns";

// Re-export for convenience
export type { ReferralStatus, RewardStatus, RewardType, RecipientType };

// --- Interfaces ---

export interface IReferral {
  id: number;
  campaign_id: number;
  referrer_id: number;
  referee_id: number;
  referral_code: string;
  status: ReferralStatus;
  current_milestone_id: number | null;
  completed_at: string | null;
  expires_at: string | null;
  flag_reason: string | null;
  created_at: string;
  updated_at: string;
  referrer?: { id: number; name: string; email: string };
  referee?: { id: number; name: string; email: string };
  campaign?: { id: number; name: string };
  current_milestone?: { id: number; name: string; sort_order: number };
}

export interface IReferralReward {
  id: string;
  referral_id: number;
  milestone_id: number;
  recipient_id: number;
  recipient_type: RecipientType;
  reward_type: RewardType;
  amount: number | null;
  tier_bonus_amount: number;
  voucher_id: number | null;
  wallet_transaction_id: string | null;
  status: RewardStatus;
  disbursed_at: string | null;
  created_at: string;
  milestone?: { id: number; name: string };
}

export interface IReferralDetail extends IReferral {
  rewards: IReferralReward[];
  campaign?: {
    id: number;
    name: string;
    milestones: {
      id: number;
      name: string;
      sort_order: number;
      event_type: string;
    }[];
  };
}

export interface IReferralOverview {
  total_referrals: number;
  active_referrals: number;
  completed_referrals: number;
  conversion_rate: number;
  total_rewards_disbursed: number;
}

export interface IReferralLeaderboard {
  user_id: number;
  user: { id: number; name: string; email: string };
  completed_count: number;
}

export interface ITierDistribution {
  tier_id: number;
  tier_name: string;
  min_referrals: number;
  max_referrals: number | null;
  referrer_count: number;
}

// --- Params ---

export interface IReferralParams extends IPaginationParams {
  campaign_id?: number;
  status?: ReferralStatus;
  date_from?: string;
  date_to?: string;
}

export interface IReferralAnalyticsParams {
  campaign_id?: number;
  period?: string;
}

export interface IReferralLeaderboardParams {
  campaign_id?: number;
  limit?: number;
}
