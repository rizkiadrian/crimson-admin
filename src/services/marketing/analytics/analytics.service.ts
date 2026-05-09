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
  /** GET /marketing/analytics/funnel — funnel stats with period filter */
  getFunnelStats: async (
    params: IFunnelParams = {}
  ): Promise<IApiResponse<IFunnelStats>> => {
    return await api.get("/marketing/analytics/funnel", { params });
  },

  /** GET /marketing/analytics/funnel/trends — funnel trends over time */
  getFunnelTrends: async (
    params: IFunnelParams = {}
  ): Promise<IApiResponse<IFunnelTrends>> => {
    return await api.get("/marketing/analytics/funnel/trends", { params });
  },

  /** GET /marketing/analytics/segments — user counts per stage */
  getSegmentSummary: async (): Promise<IApiResponse<ISegmentSummary>> => {
    return await api.get("/marketing/analytics/segments");
  },

  /** GET /marketing/analytics/segments/:stage — paginated users in stage */
  getSegmentUsers: async (
    stage: string,
    params: Omit<ISegmentUsersParams, "stage"> = {}
  ): Promise<IApiListResponse<ISegmentUser, IPaginationMeta>> => {
    return await api.get(`/marketing/analytics/segments/${stage}`, { params });
  },

  /** GET /marketing/analytics/segments/export — CSV export of segment users */
  exportSegmentCsv: async (
    params: Omit<ISegmentUsersParams, "page" | "per_page"> = { stage: "" }
  ): Promise<Blob> => {
    return await api.get("/marketing/analytics/segments/export", {
      params,
      responseType: "blob",
    });
  },

  /** GET /marketing/analytics/events — paginated event log */
  getEventLog: async (
    params: IEventLogParams = {}
  ): Promise<IApiListResponse<IUserEvent, IPaginationMeta>> => {
    return await api.get("/marketing/analytics/events", { params });
  },
};
