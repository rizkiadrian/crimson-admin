"use client";

import { useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  icons,
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
import { SearchInput } from "@app/components/ui/SearchInput";
import { useTableData } from "@lib/hooks/use-table-data";
import { useConfirmStore } from "@store/useConfirmStore";
import { useNotificationStore } from "@store/useNotificationStore";
import {
  serviceCategoriesService,
  IServiceCategory,
  IServiceCategoryParams,
} from "@services/backoffice/service-categories";
import type { CategoryType } from "@services/backoffice/service-categories";
import { PATHS } from "@config/routing";

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Format an ISO date string to Indonesian short date (e.g. 15 Jan 2025). */
const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ─── Badge Config ───────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<
  CategoryType,
  { variant: "primary" | "tertiary" | "warning" | "success"; label: string }
> = {
  general: { variant: "primary", label: "General" },
  daily: { variant: "tertiary", label: "Daily" },
  monthly: { variant: "warning", label: "Monthly" },
  popular: { variant: "success", label: "Popular" },
};

const STATUS_BADGE: Record<
  "active" | "inactive",
  { variant: "success" | "neutral"; label: string }
> = {
  active: { variant: "success", label: "Active" },
  inactive: { variant: "neutral", label: "Inactive" },
};

// ─── Columns ────────────────────────────────────────────────────────────────────

const getColumns = (
  onRefetch: () => void,
  currentPage: number
): TableColumn<IServiceCategory>[] => [
  {
    key: "icon",
    header: "Icon",
    headerClassName: "w-20",
    render: (item) => (
      <TableCell>
        {item.icon ? (
          <Image
            src={item.icon}
            alt={item.name}
            width={40}
            height={40}
            className="rounded-lg object-contain"
            unoptimized
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-[10px] text-text-muted font-medium">
            —
          </div>
        )}
      </TableCell>
    ),
  },
  {
    key: "font_icon",
    header: "Font Icon",
    headerClassName: "w-32",
    render: (item) => {
      const IconComponent = item.font_icon
        ? icons[item.font_icon as keyof typeof icons]
        : null;
      return (
        <TableCell>
          {IconComponent ? (
            <div className="flex items-center gap-2">
              <IconComponent size={20} className="text-primary-600" />
              <span className="text-xs text-text-muted">{item.font_icon}</span>
            </div>
          ) : (
            <span className="text-sm text-text-muted">—</span>
          )}
        </TableCell>
      );
    },
  },
  {
    key: "name",
    header: "Name",
    render: (item) => (
      <TableCell>
        <p className="text-[15px] font-bold text-text-main">{item.name}</p>
      </TableCell>
    ),
  },
  {
    key: "slug",
    header: "Slug",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{item.slug}</p>
      </TableCell>
    ),
  },
  {
    key: "types",
    header: "Types",
    render: (item) => (
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {item.types && item.types.length > 0 ? (
            item.types.map((type) => {
              const cfg = TYPE_BADGE[type];
              return (
                <Badge key={type} variant={cfg.variant} showDot={false}>
                  {cfg.label}
                </Badge>
              );
            })
          ) : (
            <span className="text-sm text-text-muted">—</span>
          )}
        </div>
      </TableCell>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (item) => {
      const status = item.is_active ? "active" : "inactive";
      const cfg = STATUS_BADGE[status];
      return (
        <TableCell>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </TableCell>
      );
    },
  },
  {
    key: "created_at",
    header: "Created Date",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{formatDate(item.created_at)}</p>
      </TableCell>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    render: (item) => (
      <TableCell>
        <ServiceCategoryActions
          category={item}
          onRefetch={onRefetch}
          currentPage={currentPage}
        />
      </TableCell>
    ),
  },
];

// ─── Action Buttons ─────────────────────────────────────────────────────────────

function ServiceCategoryActions({
  category,
  onRefetch,
  currentPage,
}: {
  category: IServiceCategory;
  onRefetch: () => void;
  currentPage: number;
}) {
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleToggleStatus = async () => {
    const newStatus = !category.is_active;
    const label = newStatus ? "Aktifkan" : "Nonaktifkan";

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", category.name);
      formData.append("is_active", newStatus ? "1" : "0");

      await serviceCategoriesService.update(category.id, formData);
      showNotification(
        `Service category "${category.name}" berhasil di${newStatus ? "aktifkan" : "nonaktifkan"}.`,
        "success"
      );
      onRefetch();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      showNotification(
        apiError.message || `Gagal ${label.toLowerCase()} service category`,
        "error"
      );
    }
  };

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Service Category?",
      description: `Service category "${category.name}" akan dihapus dari sistem.`,
      onConfirm: async () => {
        try {
          const resp = await serviceCategoriesService.delete(category.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal menghapus service category",
            "error"
          );
          throw err;
        }
      },
    });
  };

  const editHref =
    currentPage > 1
      ? `${PATHS.serviceCategoryEdit(category.id)}?returnPage=${currentPage}`
      : PATHS.serviceCategoryEdit(category.id);

  return (
    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
      {/* Toggle Status */}
      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-warning-600 hover:bg-warning-50 hover:border-transparent"
        aria-label={category.is_active ? "Deactivate" : "Activate"}
        onClick={handleToggleStatus}
      >
        {category.is_active ? (
          <ToggleRight size={16} />
        ) : (
          <ToggleLeft size={16} />
        )}
      </Button>

      {/* Edit */}
      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
        href={editHref}
        aria-label="Edit"
      >
        <Pencil size={16} />
      </Button>

      {/* Delete */}
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

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function ServiceCategoriesPage() {
  const fetcher = useCallback(
    (params: IServiceCategoryParams) => serviceCategoriesService.list(params),
    []
  );

  const {
    data: serviceCategories,
    isInitialLoad,
    isRefetching,
    error,
    pagination,
    handlePageChange,
    handleSearch,
    searchQuery,
    refetch,
    isMounted,
  } = useTableData<IServiceCategory, IServiceCategoryParams>({
    fetcher,
    perPage: 15,
  });

  const columns = getColumns(refetch, pagination.current_page);

  if (!isMounted) return null;

  return (
    <TableCard>
      <TableCardHeader
        title="Service Categories"
        actions={
          <>
            <SearchInput
              value={searchQuery}
              onSearch={handleSearch}
              placeholder="Search by name..."
            />
            <Button
              variant="primary"
              href={PATHS.serviceCategoryCreate}
              className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
            >
              <Plus size={16} strokeWidth={2.5} />
              Create Service Category
            </Button>
          </>
        }
      />

      <TableCardContent
        columns={columns}
        data={serviceCategories}
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
