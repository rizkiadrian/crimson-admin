import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type {
  IEventLogParams,
  IFunnelParams,
  IFunnelStats,
  IFunnelTrends,
  ISegmentSummary,
  ISegmentUser,
  ISegmentUsersParams,
  IUserEvent,
} from "./analytics.types";

export const analyticsService = {
  /** GET /backoffice/analytics/funnel — funnel stats with period filter */
  getFunnelStats: async (
    params: IFunnelParams = {}
  ): Promise<IApiResponse<IFunnelStats>> => {
    return await api.get("/backoffice/analytics/funnel", { params });
  },

  /** GET /backoffice/analytics/funnel/trends — funnel trends over time */
  getFunnelTrends: async (
    params: IFunnelParams = {}
  ): Promise<IApiResponse<IFunnelTrends>> => {
    return await api.get("/backoffice/analytics/funnel/trends", { params });
  },

  /** GET /backoffice/analytics/segments — user counts per stage */
  getSegmentSummary: async (): Promise<IApiResponse<ISegmentSummary>> => {
    return await api.get("/backoffice/analytics/segments");
  },

  /** GET /backoffice/analytics/segments/:stage — paginated users in stage */
  getSegmentUsers: async (
    stage: string,
    params: Omit<ISegmentUsersParams, "stage"> = {}
  ): Promise<IApiListResponse<ISegmentUser, IPaginationMeta>> => {
    return await api.get(`/backoffice/analytics/segments/${stage}`, { params });
  },

  /** GET /backoffice/analytics/segments/export — CSV export of segment users */
  exportSegmentCsv: async (
    params: Omit<ISegmentUsersParams, "page" | "per_page"> = { stage: "" }
  ): Promise<Blob> => {
    return await api.get("/backoffice/analytics/segments/export", {
      params,
      responseType: "blob",
    });
  },

  /** GET /backoffice/analytics/events — paginated event log */
  getEventLog: async (
    params: IEventLogParams = {}
  ): Promise<IApiListResponse<IUserEvent, IPaginationMeta>> => {
    return await api.get("/backoffice/analytics/events", { params });
  },
};
