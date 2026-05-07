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
  /** GET /backoffice/referral-analytics/overview — stats summary */
  overview: async (
    params: IReferralAnalyticsParams = {}
  ): Promise<IApiResponse<IReferralOverview>> => {
    return await api.get("/backoffice/referral-analytics/overview", { params });
  },

  /** GET /backoffice/referral-analytics/leaderboard — top referrers */
  leaderboard: async (
    params: IReferralLeaderboardParams = {}
  ): Promise<IApiResponse<IReferralLeaderboard[]>> => {
    return await api.get("/backoffice/referral-analytics/leaderboard", {
      params,
    });
  },

  /** GET /backoffice/referral-analytics/tier-distribution — tier breakdown */
  tierDistribution: async (
    campaignId: number
  ): Promise<IApiResponse<ITierDistribution[]>> => {
    return await api.get("/backoffice/referral-analytics/tier-distribution", {
      params: { campaign_id: campaignId },
    });
  },
};
