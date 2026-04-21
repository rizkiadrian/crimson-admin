"use client";

import { AlertCircle, X, CheckCircle2, Info } from "lucide-react";
import { useNotificationStore } from "@store/useNotificationStore";
import { cn } from "@lib/utils";

/**
 * Global toast notification anchored to the top-center of the viewport.
 *
 * Driven entirely by the `useNotificationStore` Zustand store — no props needed.
 * Call `showNotification(message, type)` from anywhere to trigger it.
 *
 * Supports three visual types:
 * - `"success"` — green background with a checkmark icon.
 * - `"error"` — red background with an alert icon.
 * - `"info"` — dark background with an info icon.
 *
 * Animates in/out with opacity, translate, and scale transitions.
 */
export function GlobalNotification() {
  const { isOpen, message, type, hideNotification } = useNotificationStore();

  // Base layout classes shared across all notification types
  const baseClasses =
    "fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-out flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl min-w-[320px] max-w-md border border-white/10";

  // Visibility and entrance/exit animation classes
  const stateClasses = isOpen
    ? "opacity-100 translate-y-0 scale-100"
    : "opacity-0 -translate-y-4 scale-95 pointer-events-none";

  // Color scheme per notification type
  const variantClasses = {
    error: "bg-error-600 text-white shadow-error-900/20",
    success: "bg-success-600 text-white shadow-success-900/20",
    info: "bg-secondary-900 text-white shadow-secondary-900/20",
  };

  /** Returns the appropriate icon component based on the notification type. */
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
      <div className="shrink-0 opacity-90">{renderIcon()}</div>

      <p className="flex-1 text-sm font-medium tracking-wide leading-snug text-inherit">
        {message}
      </p>

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
