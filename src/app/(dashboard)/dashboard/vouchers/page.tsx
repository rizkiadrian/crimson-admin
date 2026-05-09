"use client";

import { useCallback, useState } from "react";
import {
  Plus,
  ListFilter,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
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
  vouchersService,
  type IVoucher,
  type IVoucherParams,
  type DiscountType,
  type TargetUserType,
} from "@services/marketing/vouchers";
import { PATHS } from "@config/routing";

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Format an ISO date string to Indonesian short date (e.g. 15 Jan 2025). */
const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** Derive voucher status from its fields. */
type VoucherStatus = "active" | "inactive" | "expired" | "scheduled";

function getVoucherStatus(voucher: IVoucher): VoucherStatus {
  if (!voucher.is_active) return "inactive";
  const now = new Date();
  if (new Date(voucher.expires_at) < now) return "expired";
  if (new Date(voucher.starts_at) > now) return "scheduled";
  return "active";
}

// ─── Badge Config ───────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  VoucherStatus,
  { variant: "success" | "neutral" | "error" | "primary"; label: string }
> = {
  active: { variant: "success", label: "Active" },
  inactive: { variant: "neutral", label: "Inactive" },
  expired: { variant: "error", label: "Expired" },
  scheduled: { variant: "primary", label: "Scheduled" },
};

const DISCOUNT_TYPE_BADGE: Record<
  DiscountType,
  { variant: "primary" | "tertiary" | "warning" | "success"; label: string }
> = {
  percentage: { variant: "primary", label: "Percentage" },
  fixed_amount: { variant: "tertiary", label: "Fixed Amount" },
  free_service: { variant: "success", label: "Free Service" },
  commission_discount: { variant: "warning", label: "Commission" },
};

const TARGET_BADGE: Record<
  TargetUserType,
  { variant: "primary" | "tertiary" | "neutral"; label: string }
> = {
  client: { variant: "primary", label: "Client" },
  mitra: { variant: "tertiary", label: "Mitra" },
  all: { variant: "neutral", label: "All" },
};

// ─── Columns ────────────────────────────────────────────────────────────────────

const getColumns = (onRefetch: () => void): TableColumn<IVoucher>[] => [
  {
    key: "code",
    header: "Code",
    render: (item) => (
      <TableCell>
        <p className="text-sm font-mono text-text-main">{item.code || "—"}</p>
      </TableCell>
    ),
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
    key: "discount_type",
    header: "Discount Type",
    render: (item) => {
      const cfg = DISCOUNT_TYPE_BADGE[item.discount_type];
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
    key: "target",
    header: "Target",
    render: (item) => {
      const cfg = TARGET_BADGE[item.target_user_type];
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
      const status = getVoucherStatus(item);
      const cfg = STATUS_BADGE[status];
      return (
        <TableCell>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </TableCell>
      );
    },
  },
  {
    key: "quota",
    header: "Quota",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">
          {item.quota !== null
            ? `${item.used_count}/${item.quota}`
            : "Unlimited"}
        </p>
      </TableCell>
    ),
  },
  {
    key: "period",
    header: "Period",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">
          {formatDate(item.starts_at)} – {formatDate(item.expires_at)}
        </p>
      </TableCell>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    render: (item) => (
      <TableCell>
        <VoucherActions voucher={item} onRefetch={onRefetch} />
      </TableCell>
    ),
  },
];

// ─── Action Buttons ─────────────────────────────────────────────────────────────

function VoucherActions({
  voucher,
  onRefetch,
}: {
  voucher: IVoucher;
  onRefetch: () => void;
}) {
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleToggleActive = () => {
    const label = voucher.is_active ? "Nonaktifkan" : "Aktifkan";

    showConfirm({
      title: `${label} Voucher?`,
      description: `Voucher "${voucher.name}" akan di${voucher.is_active ? "nonaktifkan" : "aktifkan"}.`,
      confirmLabel: label,
      cancelLabel: "Batal",
      onConfirm: async () => {
        try {
          const resp = await vouchersService.toggleActive(voucher.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal mengubah status voucher",
            "error"
          );
          throw err;
        }
      },
    });
  };

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Voucher?",
      description: `Voucher "${voucher.name}" akan dihapus dari sistem.`,
      onConfirm: async () => {
        try {
          const resp = await vouchersService.delete(voucher.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal menghapus voucher",
            "error"
          );
          throw err;
        }
      },
    });
  };

  return (
    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
      {/* View Detail */}
      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
        href={PATHS.voucherDetail(voucher.id)}
        aria-label="View Detail"
      >
        <Eye size={16} />
      </Button>

      {/* Toggle Active */}
      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-warning-600 hover:bg-warning-50 hover:border-transparent"
        aria-label={voucher.is_active ? "Deactivate" : "Activate"}
        onClick={handleToggleActive}
      >
        {voucher.is_active ? (
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
        href={PATHS.voucherEdit(voucher.id)}
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

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed Amount", value: "fixed_amount" },
  { label: "Free Service", value: "free_service" },
  { label: "Commission", value: "commission_discount" },
];

const TARGET_OPTIONS = [
  { label: "Client", value: "client" },
  { label: "Mitra", value: "mitra" },
  { label: "All", value: "all" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Expired", value: "expired" },
  { label: "Scheduled", value: "scheduled" },
];

const DEFAULT_FILTERS = {
  discountTypes: [] as string[],
  targets: [] as string[],
  statuses: [] as string[],
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function VouchersPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const fetcher = useCallback(
    (params: IVoucherParams) => vouchersService.list(params),
    []
  );

  const {
    data: vouchers,
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
  } = useTableData<IVoucher, IVoucherParams>({
    fetcher,
    perPage: 15,
  });

  const columns = getColumns(refetch);

  const handleApplyFilters = () => {
    setParams({
      discount_type:
        (filters.discountTypes[0] as IVoucherParams["discount_type"]) ??
        undefined,
      target_user_type:
        (filters.targets[0] as IVoucherParams["target_user_type"]) ?? undefined,
      status: (filters.statuses[0] as IVoucherParams["status"]) ?? undefined,
    });
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setParams({
      discount_type: undefined,
      target_user_type: undefined,
      status: undefined,
    });
  };

  if (!isMounted) return null;

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="Vouchers"
          actions={
            <>
              <SearchInput
                value={searchQuery}
                onSearch={handleSearch}
                placeholder="Search by code or name..."
              />
              <Button
                variant="primary"
                href={PATHS.voucherCreate}
                className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
              >
                <Plus size={16} strokeWidth={2.5} />
                Create Voucher
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
          data={vouchers}
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
        title="Filter Vouchers"
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
        <FilterSection label="Discount Type">
          <FilterChipGroup
            options={DISCOUNT_TYPE_OPTIONS}
            selected={filters.discountTypes}
            onChange={(discountTypes) =>
              setFilters((prev) => ({ ...prev, discountTypes }))
            }
          />
        </FilterSection>

        <FilterSection label="Target">
          <FilterChipGroup
            options={TARGET_OPTIONS}
            selected={filters.targets}
            onChange={(targets) => setFilters((prev) => ({ ...prev, targets }))}
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
