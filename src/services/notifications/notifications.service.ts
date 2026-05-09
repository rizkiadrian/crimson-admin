import { api } from "@lib/api";
import type {
  INotification,
  INotificationParams,
  IUnreadCount,
  IMarkAllReadResult,
} from "./notifications.types";
import type {
  IApiListResponse,
  IApiResponse,
} from "@services/general/general.types";

export interface INotificationService {
  list: (
    params?: INotificationParams
  ) => Promise<IApiListResponse<INotification>>;
  unreadCount: () => Promise<IApiResponse<IUnreadCount>>;
  markAsRead: (id: number) => Promise<IApiResponse<INotification>>;
  markAllAsRead: () => Promise<IApiResponse<IMarkAllReadResult>>;
}

export function createNotificationService(
  baseEndpoint: string
): INotificationService {
  return {
    list: async (params: INotificationParams = {}) => {
      return await api.get(baseEndpoint, { params });
    },
    unreadCount: async () => {
      return await api.get(`${baseEndpoint}/unread-count`);
    },
    markAsRead: async (id: number) => {
      return await api.patch(`${baseEndpoint}/${id}/read`);
    },
    markAllAsRead: async () => {
      return await api.patch(`${baseEndpoint}/read-all`);
    },
  };
}
