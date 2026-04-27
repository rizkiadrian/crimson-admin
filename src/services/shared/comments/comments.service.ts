import { api } from "@lib/api";
import type { IApiResponse } from "@services/general";
import type {
  IActivityLogComment,
  ICreateCommentPayload,
} from "./comments.types";

export const commentsService = {
  /** GET /activity-logs/:id/comments — list comments for an activity log */
  list: async (
    activityLogId: number
  ): Promise<IApiResponse<IActivityLogComment[]>> => {
    return await api.get(`/activity-logs/${activityLogId}/comments`);
  },

  /** POST /activity-logs/:id/comments — create a new comment */
  create: async (
    activityLogId: number,
    payload: ICreateCommentPayload
  ): Promise<IApiResponse<IActivityLogComment>> => {
    return await api.post(`/activity-logs/${activityLogId}/comments`, payload);
  },
};
