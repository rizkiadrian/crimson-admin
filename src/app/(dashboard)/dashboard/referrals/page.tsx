"use client";

import { useCallback, useState } from "react";
import { ListFilter, Eye, Flag } from "lucide-react";
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
import { useNotificationStore } from "@store/useNotificationStore";
import { useConfirmStore } from "@store/useConfirmStore";
import {
  referralsService,
  type IReferral,
  type IReferralParams,
  type ReferralStatus,
} from "@services/marketing/referrals";
import { PATHS } from "@config/routing";

// ─── Helpers ────────────────────────────────────────────────────────────────────

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ─── Badge Config ───────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  ReferralStatus,
  { variant: "warning" | "success" | "neutral" | "error"; label: string }
> = {
  pending: { variant: "warning", label: "Pending" },
  completed: { variant: "success", label: "Completed" },
  expired: { variant: "neutral", label: "Expired" },
  flagged: { variant: "error", label: "Flagged" },
};

// ─── Columns ────────────────────────────────────────────────────────────────────

const getColumns = (onRefetch: () => void): TableColumn<IReferral>[] => [
  {
    key: "referrer",
    header: "Referrer",
    render: (item) => (
      <TableCell>
        <p className="text-sm font-semibold text-text-main">
          {item.referrer?.name || "—"}
        </p>
      </TableCell>
    ),
  },
  {
    key: "referee",
    header: "Referee",
    render: (item) => (
      <TableCell>
        <p className="text-sm font-semibold text-text-main">
          {item.referee?.name || "—"}
        </p>
      </TableCell>
    ),
  },
  {
    key: "campaign",
    header: "Campaign",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{item.campaign?.name || "—"}</p>
      </TableCell>
    ),
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
    key: "milestones",
    header: "Milestones",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">
          {item.current_milestone
            ? `${item.current_milestone.sort_order} completed`
            : "0 completed"}
        </p>
      </TableCell>
    ),
  },
  {
    key: "created_at",
    header: "Created",
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
        <ReferralActions referral={item} onRefetch={onRefetch} />
      </TableCell>
    ),
  },
];

// ─── Action Buttons ─────────────────────────────────────────────────────────────

function ReferralActions({
  referral,
  onRefetch,
}: {
  referral: IReferral;
  onRefetch: () => void;
}) {
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleFlag = () => {
    const reason = window.prompt("Enter flag reason:");
    if (!reason) return;

    showConfirm({
      title: "Flag Referral?",
      description: `Referral ini akan ditandai sebagai flagged dengan alasan: "${reason}"`,
      onConfirm: async () => {
        try {
          const resp = await referralsService.flag(referral.id, reason);
          showNotification(
            resp.message || "Referral berhasil di-flag",
            "success"
          );
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(apiError.message || "Gagal flag referral", "error");
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
        href={PATHS.referralDetail(referral.id)}
        aria-label="View Detail"
      >
        <Eye size={16} />
      </Button>

      {referral.status !== "flagged" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-2 rounded-lg hover:text-error-600 hover:bg-error-50 hover:border-transparent"
          aria-label="Flag"
          onClick={handleFlag}
        >
          <Flag size={16} />
        </Button>
      )}
    </div>
  );
}

// ─── Filter Options ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Expired", value: "expired" },
  { label: "Flagged", value: "flagged" },
];

const DEFAULT_FILTERS = {
  statuses: [] as string[],
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function ReferralsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const fetcher = useCallback(
    (params: IReferralParams) => referralsService.list(params),
    []
  );

  const {
    data: referrals,
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
  } = useTableData<IReferral, IReferralParams>({
    fetcher,
    perPage: 15,
  });

  const columns = getColumns(refetch);

  const handleApplyFilters = () => {
    setParams({
      status: (filters.statuses[0] as IReferralParams["status"]) ?? undefined,
    });
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setParams({
      status: undefined,
    });
  };

  if (!isMounted) return null;

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="Referrals"
          actions={
            <>
              <SearchInput
                value={searchQuery}
                onSearch={handleSearch}
                placeholder="Search by referrer/referee name..."
              />
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
          data={referrals}
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
        title="Filter Referrals"
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
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
