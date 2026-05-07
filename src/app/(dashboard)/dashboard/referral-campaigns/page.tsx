"use client";

import { useCallback, useState } from "react";
import { Plus, ListFilter, Pencil, Trash2, Eye } from "lucide-react";
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
  referralCampaignsService,
  type IReferralCampaign,
  type IReferralCampaignParams,
  type ReferralCampaignStatus,
  type TargetRole,
} from "@services/backoffice/referral-campaigns";
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
  ReferralCampaignStatus,
  { variant: "neutral" | "success" | "warning" | "error"; label: string }
> = {
  draft: { variant: "neutral", label: "Draft" },
  active: { variant: "success", label: "Active" },
  paused: { variant: "warning", label: "Paused" },
  ended: { variant: "error", label: "Ended" },
};

const TARGET_ROLE_BADGE: Record<
  TargetRole,
  { variant: "primary" | "tertiary"; label: string }
> = {
  client: { variant: "primary", label: "Client" },
  mitra: { variant: "tertiary", label: "Mitra" },
};

// ─── Columns ────────────────────────────────────────────────────────────────────

const getColumns = (
  onRefetch: () => void
): TableColumn<IReferralCampaign>[] => [
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
    key: "target_role",
    header: "Target Role",
    render: (item) => {
      const cfg = TARGET_ROLE_BADGE[item.target_role];
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
    key: "period",
    header: "Period",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">
          {formatDate(item.starts_at)}
          {item.ends_at ? ` – ${formatDate(item.ends_at)}` : " – No end"}
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
        <CampaignActions campaign={item} onRefetch={onRefetch} />
      </TableCell>
    ),
  },
];

// ─── Action Buttons ─────────────────────────────────────────────────────────────

function CampaignActions({
  campaign,
  onRefetch,
}: {
  campaign: IReferralCampaign;
  onRefetch: () => void;
}) {
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Campaign?",
      description: `Campaign "${campaign.name}" akan dihapus dari sistem.`,
      onConfirm: async () => {
        try {
          const resp = await referralCampaignsService.delete(campaign.id);
          showNotification(
            resp.message || "Campaign berhasil dihapus",
            "success"
          );
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal menghapus campaign",
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
        href={PATHS.referralCampaignDetail(campaign.id)}
        aria-label="View Detail"
      >
        <Eye size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
        href={PATHS.referralCampaignEdit(campaign.id)}
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

// ─── Filter Options ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Ended", value: "ended" },
];

const TARGET_ROLE_OPTIONS = [
  { label: "Client", value: "client" },
  { label: "Mitra", value: "mitra" },
];

const DEFAULT_FILTERS = {
  statuses: [] as string[],
  targetRoles: [] as string[],
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function ReferralCampaignsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const fetcher = useCallback(
    (params: IReferralCampaignParams) => referralCampaignsService.list(params),
    []
  );

  const {
    data: campaigns,
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
  } = useTableData<IReferralCampaign, IReferralCampaignParams>({
    fetcher,
    perPage: 15,
  });

  const columns = getColumns(refetch);

  const handleApplyFilters = () => {
    setParams({
      status:
        (filters.statuses[0] as IReferralCampaignParams["status"]) ?? undefined,
      target_role:
        (filters.targetRoles[0] as IReferralCampaignParams["target_role"]) ??
        undefined,
    });
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setParams({
      status: undefined,
      target_role: undefined,
    });
  };

  if (!isMounted) return null;

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="Referral Campaigns"
          actions={
            <>
              <SearchInput
                value={searchQuery}
                onSearch={handleSearch}
                placeholder="Search by campaign name..."
              />
              <Button
                variant="primary"
                href={PATHS.referralCampaignCreate}
                className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
              >
                <Plus size={16} strokeWidth={2.5} />
                Create Campaign
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
          data={campaigns}
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
        title="Filter Campaigns"
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

        <FilterSection label="Target Role">
          <FilterChipGroup
            options={TARGET_ROLE_OPTIONS}
            selected={filters.targetRoles}
            onChange={(targetRoles) =>
              setFilters((prev) => ({ ...prev, targetRoles }))
            }
          />
        </FilterSection>
      </FilterPopup>
    </>
  );
}
