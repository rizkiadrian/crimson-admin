import { create } from "zustand";
import type { INotification } from "@services/notifications";
import type { INotificationService } from "@services/notifications/notifications.service";

interface RoleNotificationState {
  unreadCount: number;
  recentNotifications: INotification[];
  isDropdownOpen: boolean;
  isLoading: boolean;
  fetchUnreadCount: () => Promise<void>;
  fetchRecent: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  toggleDropdown: () => void;
  closeDropdown: () => void;
}

export function createRoleNotificationStore(service: INotificationService) {
  return create<RoleNotificationState>((set, get) => ({
    unreadCount: 0,
    recentNotifications: [],
    isDropdownOpen: false,
    isLoading: false,

    fetchUnreadCount: async () => {
      try {
        const res = await service.unreadCount();
        set({ unreadCount: res.data.unread_count });
      } catch {
        // Silently fail
      }
    },

    fetchRecent: async () => {
      set({ isLoading: true });
      try {
        const res = await service.list({ page: 1, per_page: 5 });
        set({ recentNotifications: res.data, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    },

    markAsRead: async (id: number) => {
      try {
        await service.markAsRead(id);
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
        await service.markAllAsRead();
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
      if (!wasOpen) {
        get().fetchRecent();
      }
    },

    closeDropdown: () => set({ isDropdownOpen: false }),
  }));
}
