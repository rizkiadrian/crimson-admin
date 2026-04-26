import { create } from "zustand";
import { notificationsService } from "@services/backoffice/notifications";
import type { INotification } from "@services/backoffice/notifications";

interface BackofficeNotificationState {
  /** Number of unread notifications. */
  unreadCount: number;
  /** Recent notifications for the dropdown (latest 5). */
  recentNotifications: INotification[];
  /** Whether the dropdown is open. */
  isDropdownOpen: boolean;
  /** Whether we're currently fetching. */
  isLoading: boolean;

  /** Fetch unread count from API. */
  fetchUnreadCount: () => Promise<void>;
  /** Fetch recent notifications for dropdown. */
  fetchRecent: () => Promise<void>;
  /** Mark a single notification as read and update local state. */
  markAsRead: (id: number) => Promise<void>;
  /** Mark all notifications as read. */
  markAllAsRead: () => Promise<void>;
  /** Toggle dropdown visibility. */
  toggleDropdown: () => void;
  /** Close dropdown. */
  closeDropdown: () => void;
}

export const useBackofficeNotificationStore =
  create<BackofficeNotificationState>((set, get) => ({
    unreadCount: 0,
    recentNotifications: [],
    isDropdownOpen: false,
    isLoading: false,

    fetchUnreadCount: async () => {
      try {
        const res = await notificationsService.unreadCount();
        set({ unreadCount: res.data.unread_count });
      } catch {
        // Silently fail — badge just won't update
      }
    },

    fetchRecent: async () => {
      set({ isLoading: true });
      try {
        const res = await notificationsService.list({
          page: 1,
          per_page: 5,
        });
        set({ recentNotifications: res.data, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    },

    markAsRead: async (id: number) => {
      try {
        await notificationsService.markAsRead(id);
        const { recentNotifications, unreadCount } = get();
        set({
          recentNotifications: recentNotifications.map((n) =>
            n.id === id ? { ...n, read_at: new Date().toISOString() } : n
          ),
          unreadCount: Math.max(0, unreadCount - 1),
        });
      } catch {
        // Silently fail
      }
    },

    markAllAsRead: async () => {
      try {
        await notificationsService.markAllAsRead();
        const { recentNotifications } = get();
        set({
          recentNotifications: recentNotifications.map((n) => ({
            ...n,
            read_at: n.read_at ?? new Date().toISOString(),
          })),
          unreadCount: 0,
        });
      } catch {
        // Silently fail
      }
    },

    toggleDropdown: () => {
      const wasOpen = get().isDropdownOpen;
      set({ isDropdownOpen: !wasOpen });
      // Fetch recent when opening
      if (!wasOpen) {
        get().fetchRecent();
      }
    },

    closeDropdown: () => set({ isDropdownOpen: false }),
  }));
