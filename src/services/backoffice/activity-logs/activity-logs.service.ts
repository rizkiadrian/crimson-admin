import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type {
  IBackofficeActivityLog,
  IBackofficeActivityLogParams,
  IUpdateStatusPayload,
} from "./activity-logs.types";

export const backofficeActivityLogsService = {
  /** GET /backoffice/activity-logs — paginated list of all activity logs */
  list: async (
    params: IBackofficeActivityLogParams = {}
  ): Promise<IApiListResponse<IBackofficeActivityLog, IPaginationMeta>> => {
    return await api.get("/backoffice/activity-logs", { params });
  },

  /** GET /backoffice/activity-logs/:id — single activity log detail */
  detail: async (id: number): Promise<IApiResponse<IBackofficeActivityLog>> => {
    return await api.get(`/backoffice/activity-logs/${id}`);
  },

  /** PATCH /backoffice/activity-logs/:id/status — update status */
  updateStatus: async (
    id: number,
    payload: IUpdateStatusPayload
  ): Promise<IApiResponse<IBackofficeActivityLog>> => {
    return await api.patch(`/backoffice/activity-logs/${id}/status`, payload);
  },
};
