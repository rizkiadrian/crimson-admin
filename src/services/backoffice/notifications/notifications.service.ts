import { api } from "@lib/api";
import {
  INotification,
  INotificationParams,
  IUnreadCount,
  IMarkAllReadResult,
} from "./notifications.types";
import {
  IApiListResponse,
  IApiResponse,
} from "@services/general/general.types";

export const notificationsService = {
  /** List notifications for the current backoffice user (paginated). */
  list: async (
    params: INotificationParams = {}
  ): Promise<IApiListResponse<INotification>> => {
    return await api.get("/backoffice/notifications", { params });
  },

  /** Get unread notification count. */
  unreadCount: async (): Promise<IApiResponse<IUnreadCount>> => {
    return await api.get("/backoffice/notifications/unread-count");
  },

  /** Mark a single notification as read. */
  markAsRead: async (id: number): Promise<IApiResponse<INotification>> => {
    return await api.patch(`/backoffice/notifications/${id}/read`);
  },

  /** Mark all notifications as read. */
  markAllAsRead: async (): Promise<IApiResponse<IMarkAllReadResult>> => {
    return await api.patch("/backoffice/notifications/read-all");
  },
};
