"use client";

import { useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { notificationsService } from "@services/backoffice/notifications";
import type {
  INotification,
  INotificationParams,
} from "@services/backoffice/notifications";
import { useTableData } from "@lib/hooks/use-table-data";
import { useBackofficeNotificationStore } from "@store/useBackofficeNotificationStore";
import { useNotificationStore } from "@store/useNotificationStore";
import { Button } from "@app/components/ui/Button";
import {
  TableCard,
  TableCardHeader,
  TableCardPagination,
} from "@app/components/ui/Table";

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

export default function NotificationsPage() {
  const { showNotification } = useNotificationStore();
  const { fetchUnreadCount } = useBackofficeNotificationStore();

  const fetcher = useCallback(
    (params: INotificationParams) => notificationsService.list(params),
    []
  );

  const {
    data: notifications,
    isInitialLoad,
    isRefetching,
    error,
    pagination,
    handlePageChange,
    refetch,
  } = useTableData<INotification, INotificationParams>({
    fetcher,
    perPage: 15,
  });

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      refetch();
      fetchUnreadCount();
    } catch {
      showNotification("Gagal menandai notifikasi sebagai dibaca.", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      refetch();
      fetchUnreadCount();
      showNotification("Semua notifikasi ditandai sudah dibaca.", "success");
    } catch {
      showNotification("Gagal menandai semua notifikasi.", "error");
    }
  };

  return (
    <TableCard>
      <TableCardHeader
        title="Notifikasi"
        badge={`${pagination.total} total`}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="gap-1.5 text-tertiary-600 hover:text-tertiary-700 border-none hover:border-none hover:bg-tertiary-50"
          >
            <CheckCheck size={16} />
            Tandai semua dibaca
          </Button>
        }
      />

      {/* Loading overlay for refetch */}
      {isRefetching && (
        <div className="h-1 bg-primary-100 overflow-hidden">
          <div className="h-full bg-primary-500 animate-pulse w-full" />
        </div>
      )}

      {/* Content */}
      <div className="divide-y divide-neutral-100">
        {isInitialLoad ? (
          // Skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-neutral-200 mt-2" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 w-20 bg-neutral-200 rounded" />
                    <div className="h-4 w-24 bg-neutral-100 rounded" />
                  </div>
                  <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                  <div className="h-3 w-1/2 bg-neutral-100 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Bell size={40} strokeWidth={1.5} />
            <p className="text-sm mt-3 font-medium">Belum ada notifikasi</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <Button
              key={notif.id}
              variant="ghost"
              onClick={() => {
                if (!notif.read_at) handleMarkAsRead(notif.id);
              }}
              className={cn(
                "w-full h-auto justify-start items-start text-left px-6 py-4 rounded-none border-none hover:border-none hover:bg-neutral-50",
                !notif.read_at && "bg-primary-50/40 hover:bg-primary-50/60"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Unread dot */}
                <div className="mt-2 shrink-0">
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full",
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
                    <span className="text-xs text-neutral-400 font-medium">
                      {formatDistanceToNow(new Date(notif.created_at), {
                        addSuffix: true,
                        locale: idLocale,
                      })}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-sm",
                      notif.read_at
                        ? "text-neutral-600 font-medium"
                        : "text-neutral-900 font-semibold"
                    )}
                  >
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {notif.message}
                    </p>
                  )}
                </div>
              </div>
            </Button>
          ))
        )}
      </div>

      <TableCardPagination
        pagination={pagination}
        isInitialLoad={isInitialLoad}
        onPageChange={handlePageChange}
      />
    </TableCard>
  );
}
