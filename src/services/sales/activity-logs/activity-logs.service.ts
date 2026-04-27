import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type {
  IActivityLog,
  IActivityLogParams,
  ICreateActivityLogPayload,
} from "./activity-logs.types";

export const activityLogsService = {
  /** GET /sales/activity-logs — paginated list of current user's activity logs */
  getActivityLogs: async (
    params: IActivityLogParams = {}
  ): Promise<IApiListResponse<IActivityLog, IPaginationMeta>> => {
    return await api.get("/sales/activity-logs", { params });
  },

  /** GET /sales/activity-logs/:id — single activity log detail */
  getActivityLogDetail: async (
    id: number
  ): Promise<IApiResponse<IActivityLog>> => {
    return await api.get(`/sales/activity-logs/${id}`);
  },

  /** POST /sales/activity-logs — create a new activity log */
  createActivityLog: async (
    payload: ICreateActivityLogPayload
  ): Promise<IApiResponse<IActivityLog>> => {
    // If attachment file exists, send as multipart/form-data
    if (payload.attachment instanceof File) {
      const formData = new FormData();
      formData.append("type", payload.type);
      formData.append("title", payload.title);
      if (payload.lead_id) formData.append("lead_id", payload.lead_id);
      if (payload.description)
        formData.append("description", payload.description);
      formData.append("attachment", payload.attachment);
      if (payload.metadata?.requested_status) {
        formData.append(
          "metadata[requested_status]",
          payload.metadata.requested_status
        );
      }
      if (payload.metadata?.requested_sales_id) {
        formData.append(
          "metadata[requested_sales_id]",
          payload.metadata.requested_sales_id
        );
      }
      return await api.post("/sales/activity-logs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    // Otherwise send as JSON
    return await api.post("/sales/activity-logs", payload);
  },
};
