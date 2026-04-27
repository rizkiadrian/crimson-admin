import { api } from "@lib/api";
import type { IApiListResponse, IPaginationMeta } from "@services/general";
import type { IActivityLog, IActivityLogParams } from "./activity-logs.types";

export const activityLogsService = {
  /** GET /sales/activity-logs — paginated list of current user's activity logs */
  getActivityLogs: async (
    params: IActivityLogParams = {}
  ): Promise<IApiListResponse<IActivityLog, IPaginationMeta>> => {
    return await api.get("/sales/activity-logs", { params });
  },
};
