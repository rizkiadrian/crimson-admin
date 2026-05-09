"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import {
  Plus,
  ListFilter,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
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
import {
  FilterPopup,
  FilterSection,
  FilterChipGroup,
} from "@app/components/ui/FilterPopup";
import { SearchInput } from "@app/components/ui/SearchInput";
import { useTableData } from "@lib/hooks/use-table-data";
import { useConfirmStore } from "@store/useConfirmStore";
import { useNotificationStore } from "@store/useNotificationStore";
import {
  bannersService,
  IBanner,
  IBannerParams,
  BannerType,
  BannerStatus,
} from "@services/marketing/banners";
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
  BannerType,
  { variant: "primary" | "tertiary"; label: string }
> = {
  image: { variant: "primary", label: "Image" },
  text_placement: { variant: "tertiary", label: "Text Placement" },
};

const STATUS_BADGE: Record<
  BannerStatus,
  { variant: "success" | "neutral"; label: string }
> = {
  active: { variant: "success", label: "Active" },
  inactive: { variant: "neutral", label: "Inactive" },
};

// ─── Columns ────────────────────────────────────────────────────────────────────

const getColumns = (onRefetch: () => void): TableColumn<IBanner>[] => [
  {
    key: "thumbnail",
    header: "Thumbnail",
    headerClassName: "w-20",
    render: (item) => (
      <TableCell>
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            width={64}
            height={36}
            className="rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-[10px] text-text-muted font-medium">
            Text
          </div>
        )}
      </TableCell>
    ),
  },
  {
    key: "title",
    header: "Title",
    render: (item) => (
      <TableCell>
        <p className="text-[15px] font-bold text-text-main">{item.title}</p>
      </TableCell>
    ),
  },
  {
    key: "type",
    header: "Type",
    render: (item) => {
      const cfg = TYPE_BADGE[item.type];
      return (
        <TableCell>
          <Badge variant={cfg.variant} showDot={false}>
            {cfg.label}
          </Badge>
        </TableCell>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (item) => {
      const cfg = STATUS_BADGE[item.status];
      return (
        <TableCell>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </TableCell>
      );
    },
  },
  {
    key: "display_order",
    header: "Order",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{item.display_order}</p>
      </TableCell>
    ),
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
        <BannerActions banner={item} onRefetch={onRefetch} />
      </TableCell>
    ),
  },
];

// ─── Action Buttons ─────────────────────────────────────────────────────────────

function BannerActions({
  banner,
  onRefetch,
}: {
  banner: IBanner;
  onRefetch: () => void;
}) {
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleToggleStatus = () => {
    const newStatus: BannerStatus =
      banner.status === "active" ? "inactive" : "active";
    const label = newStatus === "active" ? "Aktifkan" : "Nonaktifkan";

    showConfirm({
      title: `${label} Banner?`,
      description: `Banner "${banner.title}" akan diubah menjadi ${newStatus}.`,
      confirmLabel: label,
      cancelLabel: "Batal",
      onConfirm: async () => {
        try {
          const resp = await bannersService.updateStatus(banner.id, {
            status: newStatus,
          });
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal mengubah status banner",
            "error"
          );
          throw err;
        }
      },
    });
  };

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Banner?",
      description: `Banner "${banner.title}" akan dihapus dari sistem.`,
      onConfirm: async () => {
        try {
          const resp = await bannersService.delete(banner.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal menghapus banner",
            "error"
          );
          throw err;
        }
      },
    });
  };

  return (
    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
      {/* Toggle Status */}
      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-warning-600 hover:bg-warning-50 hover:border-transparent"
        aria-label={banner.status === "active" ? "Deactivate" : "Activate"}
        onClick={handleToggleStatus}
      >
        {banner.status === "active" ? (
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
        href={PATHS.bannerEdit(banner.id)}
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

// ─── Filter Options ─────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { label: "Image", value: "image" },
  { label: "Text Placement", value: "text_placement" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const DEFAULT_FILTERS = {
  types: [] as string[],
  statuses: [] as string[],
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function BannersPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const fetcher = useCallback(
    (params: IBannerParams) => bannersService.list(params),
    []
  );

  const {
    data: banners,
    isInitialLoad,
    isRefetching,
    error,
    pagination,
    handlePageChange,
    handleSearch,
    searchQuery,
    refetch,
    isMounted,
    setParams,
  } = useTableData<IBanner, IBannerParams>({
    fetcher,
    perPage: 15,
  });

  const columns = getColumns(refetch);

  const handleApplyFilters = () => {
    setParams({
      type: (filters.types[0] as IBannerParams["type"]) ?? undefined,
      status: (filters.statuses[0] as IBannerParams["status"]) ?? undefined,
    });
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setParams({
      type: undefined,
      status: undefined,
    });
  };

  if (!isMounted) return null;

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="Banners"
          actions={
            <>
              <SearchInput
                value={searchQuery}
                onSearch={handleSearch}
                placeholder="Search by title..."
              />
              <Button
                variant="primary"
                href={PATHS.bannerCreate}
                className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
              >
                <Plus size={16} strokeWidth={2.5} />
                Create Banner
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-auto w-auto p-2.5"
                onClick={() => setFilterOpen(true)}
                aria-label="Filter"
              >
                <ListFilter size={18} />
              </Button>
            </>
          }
        />

        <TableCardContent
          columns={columns}
          data={banners}
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

      <FilterPopup
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Banners"
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
        <FilterSection label="Type">
          <FilterChipGroup
            options={TYPE_OPTIONS}
            selected={filters.types}
            onChange={(types) => setFilters((prev) => ({ ...prev, types }))}
          />
        </FilterSection>

        <FilterSection label="Status">
          <FilterChipGroup
            options={STATUS_OPTIONS}
            selected={filters.statuses}
            onChange={(statuses) =>
              setFilters((prev) => ({ ...prev, statuses }))
            }
          />
        </FilterSection>
      </FilterPopup>
    </>
  );
}
