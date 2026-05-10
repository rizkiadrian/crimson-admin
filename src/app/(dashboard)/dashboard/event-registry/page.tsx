"use client";

import { useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { eventRegistryService } from "@services/marketing/event-registry";
import type {
  IEventRegistry,
  IEventRegistryParams,
} from "@services/marketing/event-registry";
import { PATHS } from "@config/routing";

const CATEGORY_BADGE: Record<
  string,
  { variant: "primary" | "tertiary" | "success" | "warning"; label: string }
> = {
  lifecycle: { variant: "primary", label: "Lifecycle" },
  engagement: { variant: "tertiary", label: "Engagement" },
  marketing: { variant: "warning", label: "Marketing" },
  transaction: { variant: "success", label: "Transaction" },
};

function EventActions({
  event,
  onRefetch,
}: {
  event: IEventRegistry;
  onRefetch: () => void;
}) {
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);

  if (event.is_system) return null;

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Event?",
      description: `Event "${event.label}" akan dihapus.`,
      onConfirm: async () => {
        try {
          const resp = await eventRegistryService.delete(event.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal menghapus event",
            "error"
          );
          throw err;
        }
      },
    });
  };

  return (
    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
        href={PATHS.eventRegistryEdit(event.id)}
        aria-label="Edit"
      >
        <Pencil size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-error-600 hover:bg-error-50 hover:border-transparent"
        aria-label="Delete"
        onClick={handleDelete}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}

const getColumns = (onRefetch: () => void): TableColumn<IEventRegistry>[] => [
  {
    key: "key",
    header: "Key",
    render: (item) => (
      <TableCell>
        <code className="text-sm font-mono bg-neutral-100 px-2 py-0.5 rounded">
          {item.key}
        </code>
      </TableCell>
    ),
  },
  {
    key: "label",
    header: "Label",
    render: (item) => (
      <TableCell>
        <p className="text-[15px] font-medium text-text-main">{item.label}</p>
      </TableCell>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (item) => {
      const badge = CATEGORY_BADGE[item.category] || {
        variant: "neutral" as const,
        label: item.category,
      };
      return (
        <TableCell>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </TableCell>
      );
    },
  },
  {
    key: "source",
    header: "Source",
    render: (item) => (
      <TableCell>
        <Badge variant={item.is_system ? "primary" : "neutral"}>
          {item.is_system ? "System" : "Custom"}
        </Badge>
      </TableCell>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (item) => (
      <TableCell>
        <Badge variant={item.is_active ? "success" : "neutral"}>
          {item.is_active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    render: (item) => (
      <TableCell>
        <EventActions event={item} onRefetch={onRefetch} />
      </TableCell>
    ),
  },
];

export default function EventRegistryPage() {
  const fetcher = useCallback(
    (params: IEventRegistryParams) => eventRegistryService.list(params),
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
  } = useTableData<IEventRegistry, IEventRegistryParams>({
    fetcher,
    perPage: 20,
  });

  if (!isMounted) return null;

  return (
    <TableCard>
      <TableCardHeader
        title="Event Registry"
        actions={
          <Button
            variant="primary"
            href={PATHS.eventRegistryCreate}
            className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
          >
            <Plus size={16} strokeWidth={2.5} />
            Create Event
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
