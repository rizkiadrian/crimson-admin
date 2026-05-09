import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type {
  IReferralCampaign,
  IReferralCampaignCreatePayload,
  IReferralCampaignDetail,
  IReferralCampaignParams,
  IReferralCampaignUpdatePayload,
  ReferralCampaignStatus,
} from "./referral-campaigns.types";

export const referralCampaignsService = {
  /** GET /marketing/referral-campaigns — paginated list with filters */
  list: async (
    params: IReferralCampaignParams = {}
  ): Promise<IApiListResponse<IReferralCampaign, IPaginationMeta>> => {
    return await api.get("/marketing/referral-campaigns", { params });
  },

  /** GET /marketing/referral-campaigns/:id — campaign detail with milestones & tiers */
  detail: async (
    id: number
  ): Promise<IApiResponse<IReferralCampaignDetail>> => {
    return await api.get(`/marketing/referral-campaigns/${id}`);
  },

  /** POST /marketing/referral-campaigns — create a new campaign */
  create: async (
    data: IReferralCampaignCreatePayload
  ): Promise<IApiResponse<IReferralCampaignDetail>> => {
    return await api.post("/marketing/referral-campaigns", data);
  },

  /** PUT /marketing/referral-campaigns/:id — update campaign */
  update: async (
    id: number,
    data: IReferralCampaignUpdatePayload
  ): Promise<IApiResponse<IReferralCampaignDetail>> => {
    return await api.put(`/marketing/referral-campaigns/${id}`, data);
  },

  /** DELETE /marketing/referral-campaigns/:id — soft delete campaign */
  delete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/marketing/referral-campaigns/${id}`);
  },

  /** PATCH /marketing/referral-campaigns/:id/status — update campaign status */
  updateStatus: async (
    id: number,
    status: ReferralCampaignStatus
  ): Promise<IApiResponse<IReferralCampaign>> => {
    return await api.patch(`/marketing/referral-campaigns/${id}/status`, {
      status,
    });
  },
};
