import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
} from "@services/general/general.types";
import type {
  ISalesNotification,
  ISalesNotificationParams,
  ISalesUnreadCount,
  ISalesMarkAllReadResult,
} from "./notifications.types";

export const salesNotificationsService = {
  /** List notifications for the current sales user (paginated). */
  list: async (
    params: ISalesNotificationParams = {}
  ): Promise<IApiListResponse<ISalesNotification>> => {
    return await api.get("/sales/notifications", { params });
  },

  /** Get unread notification count. */
  unreadCount: async (): Promise<IApiResponse<ISalesUnreadCount>> => {
    return await api.get("/sales/notifications/unread-count");
  },

  /** Mark a single notification as read. */
  markAsRead: async (id: number): Promise<IApiResponse<ISalesNotification>> => {
    return await api.patch(`/sales/notifications/${id}/read`);
  },

  /** Mark all notifications as read. */
  markAllAsRead: async (): Promise<IApiResponse<ISalesMarkAllReadResult>> => {
    return await api.patch("/sales/notifications/read-all");
  },
};
