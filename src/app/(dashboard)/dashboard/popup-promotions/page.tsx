"use client";

import { useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Pause,
  Play,
  CalendarClock,
} from "lucide-react";
import {
  TableCard,
  TableCardHeader,
  TableCardContent,
  TableCardPagination,
  TableCell,
  Badge,
} from "@app/components/ui/Table";
import type { TableColumn } from "@app/components/ui/Table";
import { Button } from "@app/components/ui/Button";
import { useTableData } from "@lib/hooks/use-table-data";
import { useConfirmStore } from "@store/useConfirmStore";
import { useNotificationStore } from "@store/useNotificationStore";
import { popupPromotionsService } from "@services/marketing/popup-promotions";
import type {
  IPopupPromotion,
  IPopupPromotionParams,
  PopupStatus,
  PopupContentType,
} from "@services/marketing/popup-promotions";
import { PATHS } from "@config/routing";

const STATUS_BADGE: Record<
  PopupStatus,
  {
    variant: "neutral" | "primary" | "success" | "warning" | "error";
    label: string;
  }
> = {
  draft: { variant: "neutral", label: "Draft" },
  scheduled: { variant: "primary", label: "Scheduled" },
  active: { variant: "success", label: "Active" },
  paused: { variant: "warning", label: "Paused" },
  ended: { variant: "error", label: "Ended" },
};

const TYPE_BADGE: Record<
  PopupContentType,
  { variant: "primary" | "tertiary" | "success" | "warning"; label: string }
> = {
  template: { variant: "primary", label: "Template" },
  image: { variant: "tertiary", label: "Image" },
  canvas: { variant: "success", label: "Canvas" },
  html: { variant: "warning", label: "HTML" },
};

function PopupActions({
  popup,
  onRefetch,
}: {
  popup: IPopupPromotion;
  onRefetch: () => void;
}) {
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleStatusToggle = async () => {
    const newStatus: PopupStatus =
      popup.status === "active" ? "paused" : "active";
    try {
      const resp = await popupPromotionsService.changeStatus(
        popup.id,
        newStatus
      );
      showNotification(resp.message, "success");
      onRefetch();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      showNotification(apiError.message || "Gagal mengubah status", "error");
    }
  };

  const handleDuplicate = async () => {
    try {
      const resp = await popupPromotionsService.duplicate(popup.id);
      showNotification(resp.message, "success");
      onRefetch();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      showNotification(apiError.message || "Gagal menduplikasi", "error");
    }
  };

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Popup?",
      description: `Popup "${popup.name}" akan dihapus.`,
      onConfirm: async () => {
        try {
          const resp = await popupPromotionsService.delete(popup.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(apiError.message || "Gagal menghapus", "error");
          throw err;
        }
      },
    });
  };

  return (
    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
      {popup.status === "draft" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
          href={PATHS.popupPromotionSchedule(popup.id)}
          aria-label="Set Schedule"
        >
          <CalendarClock size={14} />
        </Button>
      )}
      {(popup.status === "active" || popup.status === "paused") && (
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
          onClick={handleStatusToggle}
          aria-label={popup.status === "active" ? "Pause" : "Resume"}
        >
          {popup.status === "active" ? <Pause size={14} /> : <Play size={14} />}
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
        onClick={handleDuplicate}
        aria-label="Duplicate"
      >
        <Copy size={14} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
        href={PATHS.popupPromotionEdit(popup.id)}
        aria-label="Edit"
      >
        <Pencil size={14} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-error-600 hover:bg-error-50 hover:border-transparent"
        onClick={handleDelete}
        aria-label="Delete"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}

const getColumns = (onRefetch: () => void): TableColumn<IPopupPromotion>[] => [
  {
    key: "name",
    header: "Name",
    render: (item) => (
      <TableCell>
        <div className="flex items-center gap-2">
          {item.ab_group_id && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${item.ab_variant === "A" ? "bg-primary-50 text-primary-600 border border-primary-200" : "bg-tertiary-50 text-tertiary-600 border border-tertiary-200"}`}
            >
              {item.ab_variant}
            </span>
          )}
          <Button
            href={PATHS.popupPromotionDetail(item.id)}
            variant="ghost"
            className="p-0 h-auto hover:bg-transparent hover:border-transparent"
          >
            <p className="text-[15px] font-bold text-text-main hover:text-primary-600">
              {item.name}
            </p>
          </Button>
        </div>
      </TableCell>
    ),
  },
  {
    key: "content_type",
    header: "Type",
    render: (item) => {
      const badge = TYPE_BADGE[item.content_type];
      return (
        <TableCell>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </TableCell>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (item) => {
      const badge = STATUS_BADGE[item.status];
      return (
        <TableCell>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </TableCell>
      );
    },
  },
  {
    key: "priority",
    header: "Priority",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{item.priority}</p>
      </TableCell>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    render: (item) => (
      <TableCell>
        <PopupActions popup={item} onRefetch={onRefetch} />
      </TableCell>
    ),
  },
];

export default function PopupPromotionsPage() {
  const fetcher = useCallback(
    (params: IPopupPromotionParams) => popupPromotionsService.getAll(params),
    []
  );

  const {
    data,
    isInitialLoad,
    isRefetching,
    error,
    pagination,
    handlePageChange,
    refetch,
    isMounted,
  } = useTableData<IPopupPromotion, IPopupPromotionParams>({
    fetcher,
    perPage: 15,
  });

  if (!isMounted) return null;

  return (
    <TableCard>
      <TableCardHeader
        title="Popup Promotions"
        actions={
          <Button
            variant="primary"
            href={PATHS.popupPromotionCreate}
            className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
          >
            <Plus size={16} strokeWidth={2.5} />
            Create Popup
          </Button>
        }
      />
      <TableCardContent
        columns={getColumns(refetch)}
        data={data}
        keyExtractor={(item) => item.id}
        isRefetching={isRefetching}
        isLoading={isInitialLoad}
        error={error}
      />
      <TableCardPagination
        pagination={pagination}
        isInitialLoad={isInitialLoad}
        error={error}
        onPageChange={handlePageChange}
      />
    </TableCard>
  );
}
