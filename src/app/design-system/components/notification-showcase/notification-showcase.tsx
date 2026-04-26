"use client";

import React from "react";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@lib/utils";
import { Text } from "@app/components/ui/Text";

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

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "activity_log",
    typeLabel: "ACTIVITY LOG",
    title: "Adi Pratama membuat Request Lead Assign",
    message: "Request assign lead #1 to me",
    time: "2 menit yang lalu",
    read: false,
  },
  {
    id: 2,
    type: "lead_assign_request",
    typeLabel: "LEAD ASSIGN",
    title: "Budi Santoso meminta assign lead baru",
    message: "Lead: PT Maju Jaya",
    time: "15 menit yang lalu",
    read: false,
  },
  {
    id: 3,
    type: "lead_status_request",
    typeLabel: "LEAD STATUS",
    title: "Citra Dewi memperbarui status lead",
    message: "Status: contacted → qualified",
    time: "1 jam yang lalu",
    read: true,
  },
  {
    id: 4,
    type: "activity_log",
    typeLabel: "ACTIVITY LOG",
    title: "Adi Pratama memperbarui Request Lead Assign",
    message: "Updated: Request assign lead #1",
    time: "2 jam yang lalu",
    read: true,
  },
];

export function NotificationShowcase() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Bell Icon Variants */}
      <div className="space-y-6">
        <Text
          variant="label"
          className="text-secondary-600 uppercase tracking-wider"
        >
          Bell Icon States
        </Text>
        <div className="bg-white rounded-2xl border border-neutral-200 p-8">
          <div className="flex items-center gap-8">
            {/* No notifications */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative p-2 text-neutral-800 hover:bg-neutral-100 rounded-full transition-all">
                <Bell size={22} strokeWidth={2} />
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                No unread
              </span>
            </div>

            {/* With count */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative p-2 text-neutral-800 hover:bg-neutral-100 rounded-full transition-all">
                <Bell size={22} strokeWidth={2} />
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary-600 text-white text-[10px] font-bold rounded-full border-2 border-white">
                  3
                </span>
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                3 unread
              </span>
            </div>

            {/* High count */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative p-2 text-neutral-800 hover:bg-neutral-100 rounded-full transition-all">
                <Bell size={22} strokeWidth={2} />
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary-600 text-white text-[10px] font-bold rounded-full border-2 border-white">
                  99+
                </span>
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                99+ unread
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Type Badges */}
      <div className="space-y-6">
        <Text
          variant="label"
          className="text-secondary-600 uppercase tracking-wider"
        >
          Notification Type Badges
        </Text>
        <div className="bg-white rounded-2xl border border-neutral-200 p-8">
          <div className="flex flex-wrap gap-3">
            {[
              { type: "activity_log", label: "ACTIVITY LOG" },
              { type: "lead_assign_request", label: "LEAD ASSIGN" },
              { type: "lead_status_request", label: "LEAD STATUS" },
            ].map((item) => (
              <span
                key={item.type}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded",
                  typeBadgeClass(item.type)
                )}
              >
                {item.label}
              </span>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-4">
            Each notification type has a distinct color badge: tertiary for
            activity logs, warning for lead assign requests, success for lead
            status updates.
          </p>
        </div>
      </div>

      {/* Dropdown Preview */}
      <div className="lg:col-span-2 space-y-6">
        <Text
          variant="label"
          className="text-secondary-600 uppercase tracking-wider"
        >
          Notification Dropdown
        </Text>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-[400px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900">Notifikasi</h3>
              <span className="bg-primary-100 text-primary-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                2 baru
              </span>
            </div>
            <button className="flex items-center gap-1 text-xs font-semibold text-tertiary-600 hover:text-tertiary-700 transition-colors cursor-pointer">
              <CheckCheck size={14} />
              Tandai semua dibaca
            </button>
          </div>

          {/* Notification items */}
          <div className="max-h-[360px] overflow-y-auto">
            {MOCK_NOTIFICATIONS.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "w-full text-left px-5 py-3.5 border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer",
                  !notif.read && "bg-primary-50/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 shrink-0">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        notif.read ? "bg-transparent" : "bg-primary-500"
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
                        {notif.typeLabel}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-medium">
                        {notif.time}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm truncate",
                        notif.read
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
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 px-5 py-3">
            <p className="text-center text-sm font-semibold text-tertiary-600">
              Lihat semua notifikasi
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="space-y-6">
        <Text
          variant="label"
          className="text-secondary-600 uppercase tracking-wider"
        >
          Empty State
        </Text>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm max-w-[400px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Notifikasi</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
            <Bell size={32} strokeWidth={1.5} />
            <p className="text-sm mt-2 font-medium">Belum ada notifikasi</p>
          </div>
        </div>
      </div>

      {/* Full Page Item */}
      <div className="space-y-6">
        <Text
          variant="label"
          className="text-secondary-600 uppercase tracking-wider"
        >
          Full Page Item (Read vs Unread)
        </Text>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          {/* Unread */}
          <div className="w-full text-left px-6 py-4 bg-primary-50/40 border-b border-neutral-100">
            <div className="flex items-start gap-3">
              <div className="mt-2 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-tertiary-100 text-tertiary-700">
                    ACTIVITY LOG
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    2 menit yang lalu
                  </span>
                </div>
                <p className="text-sm text-neutral-900 font-semibold">
                  Adi Pratama membuat Request Lead Assign
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Request assign lead #1 to me
                </p>
              </div>
            </div>
          </div>
          {/* Read */}
          <div className="w-full text-left px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-2 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-success-100 text-success-700">
                    LEAD STATUS
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    1 jam yang lalu
                  </span>
                </div>
                <p className="text-sm text-neutral-600 font-medium">
                  Citra Dewi memperbarui status lead
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Status: contacted → qualified
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
