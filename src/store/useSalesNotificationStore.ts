import { create } from "zustand";
import { salesNotificationsService } from "@services/sales/notifications";
import type { ISalesNotification } from "@services/sales/notifications";

interface SalesNotificationState {
  /** Number of unread notifications. */
  unreadCount: number;
  /** Recent notifications for the dropdown (latest 5). */
  recentNotifications: ISalesNotification[];
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

export const useSalesNotificationStore = create<SalesNotificationState>(
  (set, get) => ({
    unreadCount: 0,
    recentNotifications: [],
    isDropdownOpen: false,
    isLoading: false,

    fetchUnreadCount: async () => {
      try {
        const res = await salesNotificationsService.unreadCount();
        set({ unreadCount: res.data.unread_count });
      } catch {
        // Silently fail — badge just won't update
      }
    },

    fetchRecent: async () => {
      set({ isLoading: true });
      try {
        const res = await salesNotificationsService.list({
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
        await salesNotificationsService.markAsRead(id);
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
        await salesNotificationsService.markAllAsRead();
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
  })
);
