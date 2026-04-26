import { IPaginationParams } from "@services/general";

export interface INotification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read_at: string | null;
  reference_type: string | null;
  reference_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface IUnreadCount {
  unread_count: number;
}

export interface IMarkAllReadResult {
  marked_count: number;
}

export type INotificationParams = IPaginationParams;
