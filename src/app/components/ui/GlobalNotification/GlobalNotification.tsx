// src/components/ui/GlobalNotification.tsx
"use client";

import { AlertCircle, X, CheckCircle2, Info } from "lucide-react";
import { useNotificationStore } from "@store/useNotificationStore";
import { cn } from "@lib/utils";

export function GlobalNotification() {
  const { isOpen, message, type, hideNotification } = useNotificationStore();

  // Animasi masuk dan keluar menggunakan Tailwind
  const baseClasses =
    "fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-out flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl min-w-[320px] max-w-md border border-white/10";

  const stateClasses = isOpen
    ? "opacity-100 translate-y-0 scale-100"
    : "opacity-0 -translate-y-4 scale-95 pointer-events-none";

  // Warna sesuai Design System (Memakai State Palettes yang baru)
  const variantClasses = {
    error: "bg-error-600 text-white shadow-error-900/20",
    success: "bg-success-600 text-white shadow-success-900/20",
    info: "bg-secondary-900 text-white shadow-secondary-900/20",
  };

  // Render Icon dinamis berdasarkan tipe notifikasi
  const renderIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5" />;
      case "info":
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn(baseClasses, stateClasses, variantClasses[type])}>
      {/* Icon Kiri */}
      <div className="shrink-0 opacity-90">{renderIcon()}</div>

      {/* Teks Pesan */}
      <p className="flex-1 text-sm font-medium tracking-wide leading-snug text-inherit">
        {message}
      </p>

      {/* Tombol Tutup Manual */}
      <button
        onClick={hideNotification}
        className="shrink-0 p-1.5 -mr-1 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
