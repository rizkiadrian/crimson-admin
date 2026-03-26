// src/store/useNotificationStore.ts
import { create } from "zustand";

interface NotificationState {
  isOpen: boolean;
  message: string;
  type: "error" | "success" | "info";
  showNotification: (
    message: string,
    type?: "error" | "success" | "info"
  ) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  isOpen: false,
  message: "",
  type: "error", // Default tipe adalah error

  showNotification: (message, type = "error") => {
    // 1. Tampilkan notifikasi
    set({ isOpen: true, message, type });

    // 2. Hilangkan otomatis setelah 4 detik
    setTimeout(() => {
      // Pastikan pesan yang sedang aktif sama sebelum menutup otomatis
      // (Mencegah bug jika user men-trigger notif baru dengan cepat)
      if (get().isOpen && get().message === message) {
        set({ isOpen: false });
      }
    }, 4000);
  },

  hideNotification: () => set({ isOpen: false }),
}));
