import type { IPaginationParams } from "@services/general";

/** Single sales notification */
export interface ISalesNotification {
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

export interface ISalesUnreadCount {
  unread_count: number;
}

export interface ISalesMarkAllReadResult {
  marked_count: number;
}

export type ISalesNotificationParams = IPaginationParams;
