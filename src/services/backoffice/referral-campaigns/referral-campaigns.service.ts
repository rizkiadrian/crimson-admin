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
  /** GET /backoffice/referral-campaigns — paginated list with filters */
  list: async (
    params: IReferralCampaignParams = {}
  ): Promise<IApiListResponse<IReferralCampaign, IPaginationMeta>> => {
    return await api.get("/backoffice/referral-campaigns", { params });
  },

  /** GET /backoffice/referral-campaigns/:id — campaign detail with milestones & tiers */
  detail: async (
    id: number
  ): Promise<IApiResponse<IReferralCampaignDetail>> => {
    return await api.get(`/backoffice/referral-campaigns/${id}`);
  },

  /** POST /backoffice/referral-campaigns — create a new campaign */
  create: async (
    data: IReferralCampaignCreatePayload
  ): Promise<IApiResponse<IReferralCampaignDetail>> => {
    return await api.post("/backoffice/referral-campaigns", data);
  },

  /** PUT /backoffice/referral-campaigns/:id — update campaign */
  update: async (
    id: number,
    data: IReferralCampaignUpdatePayload
  ): Promise<IApiResponse<IReferralCampaignDetail>> => {
    return await api.put(`/backoffice/referral-campaigns/${id}`, data);
  },

  /** DELETE /backoffice/referral-campaigns/:id — soft delete campaign */
  delete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/backoffice/referral-campaigns/${id}`);
  },

  /** PATCH /backoffice/referral-campaigns/:id/status — update campaign status */
  updateStatus: async (
    id: number,
    status: ReferralCampaignStatus
  ): Promise<IApiResponse<IReferralCampaign>> => {
    return await api.patch(`/backoffice/referral-campaigns/${id}/status`, {
      status,
    });
  },
};
