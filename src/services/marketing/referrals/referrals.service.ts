import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type {
  IReferral,
  IReferralDetail,
  IReferralParams,
  IReferralReward,
} from "./referrals.types";

export const referralsService = {
  /** GET /marketing/referrals — paginated list with filters */
  list: async (
    params: IReferralParams = {}
  ): Promise<IApiListResponse<IReferral, IPaginationMeta>> => {
    return await api.get("/marketing/referrals", { params });
  },

  /** GET /marketing/referrals/:id — referral detail with rewards & milestone progress */
  detail: async (id: number): Promise<IApiResponse<IReferralDetail>> => {
    return await api.get(`/marketing/referrals/${id}`);
  },

  /** PATCH /marketing/referrals/:id/flag — flag a referral */
  flag: async (
    id: number,
    reason: string
  ): Promise<IApiResponse<IReferral>> => {
    return await api.patch(`/marketing/referrals/${id}/flag`, { reason });
  },

  /** PATCH /marketing/referral-rewards/:id/retry — retry failed reward disbursement */
  retryReward: async (
    rewardId: string
  ): Promise<IApiResponse<IReferralReward>> => {
    return await api.patch(`/marketing/referral-rewards/${rewardId}/retry`);
  },
};
