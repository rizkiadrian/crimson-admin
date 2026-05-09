import { api } from "@lib/api";
import type { IApiResponse } from "@services/general";
import type {
  IReferralAnalyticsParams,
  IReferralLeaderboard,
  IReferralLeaderboardParams,
  IReferralOverview,
  ITierDistribution,
} from "./referrals.types";

export const referralAnalyticsService = {
  /** GET /marketing/referral-analytics/overview — stats summary */
  overview: async (
    params: IReferralAnalyticsParams = {}
  ): Promise<IApiResponse<IReferralOverview>> => {
    return await api.get("/marketing/referral-analytics/overview", { params });
  },

  /** GET /marketing/referral-analytics/leaderboard — top referrers */
  leaderboard: async (
    params: IReferralLeaderboardParams = {}
  ): Promise<IApiResponse<IReferralLeaderboard[]>> => {
    return await api.get("/marketing/referral-analytics/leaderboard", {
      params,
    });
  },

  /** GET /marketing/referral-analytics/tier-distribution — tier breakdown */
  tierDistribution: async (
    campaignId: number
  ): Promise<IApiResponse<ITierDistribution[]>> => {
    return await api.get("/marketing/referral-analytics/tier-distribution", {
      params: { campaign_id: campaignId },
    });
  },
};
