"use client";

import { useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useBackofficeNotificationStore } from "@store/useBackofficeNotificationStore";
import { useUserProfile } from "@store/useUserProfile";
import { BUSINESSFLOW } from "@config/env";
import { cn } from "@lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Button } from "@app/components/ui/Button";

/** Notification type → human-readable label. */
function typeLabel(type: string): string {
  switch (type) {
    case "activity_log":
      return "Activity Log";
    case "lead_assign_request":
      return "Lead Assign";
    case "lead_status_request":
      return "Lead Status";
    default:
      return "Notifikasi";
  }
}

/** Notification type → badge color. */
function typeBadgeClass(type: string): string {
  switch (type) {
    case "activity_log":
      return "bg-tertiary-100 text-tertiary-700";
    case "lead_assign_request":
      return "bg-warning-100 text-warning-700";
    case "lead_status_request":
      return "bg-success-100 text-success-700";
    default:
      return "bg-neutral-100 text-neutral-600";
  }
}

export function NotificationBell() {
  const { profile } = useUserProfile();
  const {
    unreadCount,
    recentNotifications,
    isDropdownOpen,
    isLoading,
    fetchUnreadCount,
    toggleDropdown,
    closeDropdown,
    markAsRead,
    markAllAsRead,
  } = useBackofficeNotificationStore();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (profile && BUSINESSFLOW.backofficeRoles.includes(profile.role_name)) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30_000);
      return () => clearInterval(interval);
    }
  }, [fetchUnreadCount, profile]);

  // Close dropdown on outside click
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    },
    [closeDropdown]
  );

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("mouseup", handleMouseUp);
      return () => document.removeEventListener("mouseup", handleMouseUp);
    }
  }, [isDropdownOpen, handleMouseUp]);

  return (
    <div className="relative">
      {/* Bell button */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={toggleDropdown}
        className="rounded-full relative border-none hover:border-none hover:bg-neutral-100 text-neutral-800"
        aria-label="Notifikasi"
      >
        <Bell size={20} strokeWidth={2} className="md:w-[22px] md:h-[22px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary-600 text-white text-[10px] font-bold rounded-full border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl shadow-xl border border-neutral-200/60 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="bg-primary-100 text-primary-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="gap-1 h-auto py-1 px-2 text-xs text-tertiary-600 hover:text-tertiary-700 border-none hover:border-none hover:bg-tertiary-50"
              >
                <CheckCheck size={14} />
                Tandai semua dibaca
              </Button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={24} className="animate-spin text-neutral-400" />
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                <Bell size={32} strokeWidth={1.5} />
                <p className="text-sm mt-2 font-medium">Belum ada notifikasi</p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <Button
                  key={notif.id}
                  variant="ghost"
                  onClick={() => {
                    if (!notif.read_at) markAsRead(notif.id);
                  }}
                  className={cn(
                    "w-full h-auto justify-start items-start text-left px-5 py-3.5 rounded-none border-none hover:border-none border-b border-b-neutral-50 hover:bg-neutral-50",
                    !notif.read_at && "bg-primary-50/40 hover:bg-primary-50/60"
                  )}
                >
                  <div className="flex items-start gap-3 w-full">
                    {/* Unread dot */}
                    <div className="mt-1.5 shrink-0">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          notif.read_at ? "bg-transparent" : "bg-primary-500"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded",
                            typeBadgeClass(notif.type)
                          )}
                        >
                          {typeLabel(notif.type)}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-medium">
                          {formatDistanceToNow(new Date(notif.created_at), {
                            addSuffix: true,
                            locale: idLocale,
                          })}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-sm truncate",
                          notif.read_at
                            ? "text-neutral-600 font-medium"
                            : "text-neutral-900 font-semibold"
                        )}
                      >
                        {notif.title}
                      </p>
                      {notif.message && (
                        <p className="text-xs text-neutral-500 mt-0.5 truncate">
                          {notif.message}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 px-5 py-3">
            <Button
              variant="ghost"
              href="/dashboard/notifications"
              onClick={closeDropdown}
              className="w-full justify-center h-auto py-1 text-sm text-tertiary-600 hover:text-tertiary-700 border-none hover:border-none hover:bg-transparent"
            >
              Lihat semua notifikasi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
