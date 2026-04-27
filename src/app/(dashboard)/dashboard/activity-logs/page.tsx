"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ListFilter } from "lucide-react";
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
import {
  backofficeActivityLogsService,
  IBackofficeActivityLog,
  IBackofficeActivityLogParams,
} from "@services/backoffice/activity-logs";

// ─── Badge Configs ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  string,
  { variant: "warning" | "success" | "error"; label: string }
> = {
  pending: { variant: "warning", label: "Pending" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "error", label: "Rejected" },
};

const TYPE_BADGE: Record<
  string,
  { variant: "primary" | "tertiary" | "neutral"; label: string }
> = {
  general_note: { variant: "neutral", label: "General Note" },
  request_lead_assign: { variant: "primary", label: "Request Lead Assign" },
  request_update_lead_status: {
    variant: "tertiary",
    label: "Update Lead Status",
  },
};

// ─── Columns ────────────────────────────────────────────────────────────────────

const columns: TableColumn<IBackofficeActivityLog>[] = [
  {
    key: "user",
    header: "Sales",
    render: (item) => (
      <TableCell>
        <p className="text-[15px] font-bold text-text-main">
          {item.user?.name ?? "—"}
        </p>
      </TableCell>
    ),
  },
  {
    key: "title",
    header: "Title",
    render: (item) => (
      <TableCell>
        <Link
          href={`/dashboard/activity-logs/${item.id}`}
          className="text-[15px] font-bold text-primary-600 hover:underline"
        >
          {item.title}
        </Link>
      </TableCell>
    ),
  },
  {
    key: "type",
    header: "Type",
    render: (item) => {
      const cfg = TYPE_BADGE[item.type] ?? {
        variant: "neutral" as const,
        label: item.type,
      };
      return (
        <TableCell>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </TableCell>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (item) => {
      const cfg = STATUS_BADGE[item.status] ?? {
        variant: "neutral" as const,
        label: item.status,
      };
      return (
        <TableCell>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </TableCell>
      );
    },
  },
  {
    key: "lead",
    header: "Lead",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{item.lead?.name ?? "—"}</p>
      </TableCell>
    ),
  },
  {
    key: "requested",
    header: "Requested",
    render: (item) => {
      if (
        item.type === "request_update_lead_status" &&
        item.metadata?.requested_status
      ) {
        const status = String(item.metadata.requested_status);
        const label =
          {
            new: "New",
            contacted: "Contacted",
            qualified: "Qualified",
            proposal: "Proposal",
            negotiation: "Negotiation",
            won: "Won",
            lost: "Lost",
          }[status] ?? status;
        return (
          <TableCell>
            <p className="text-xs text-text-muted">→ {label}</p>
          </TableCell>
        );
      }
      if (
        item.type === "request_lead_assign" &&
        item.metadata?.requested_sales_id
      ) {
        return (
          <TableCell>
            <p className="text-xs text-text-muted">
              {String(item.metadata.requested_sales_id)}
            </p>
          </TableCell>
        );
      }
      return (
        <TableCell>
          <p className="text-sm text-text-muted">—</p>
        </TableCell>
      );
    },
  },
  {
    key: "created_at",
    header: "Created",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">
          {new Date(item.created_at).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </TableCell>
    ),
  },
];

// ─── Filter Options ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const TYPE_OPTIONS = [
  { label: "General Note", value: "general_note" },
  { label: "Request Lead Assign", value: "request_lead_assign" },
  { label: "Update Lead Status", value: "request_update_lead_status" },
];

const DEFAULT_FILTERS = {
  statuses: [] as string[],
  types: [] as string[],
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function BackofficeActivityLogsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const fetcher = useCallback(
    (params: IBackofficeActivityLogParams) =>
      backofficeActivityLogsService.list(params),
    []
  );

  const {
    data: activityLogs,
    isInitialLoad,
    isRefetching,
    error,
    pagination,
    handlePageChange,
    handleSearch,
    searchQuery,
    isMounted,
    setParams,
  } = useTableData<IBackofficeActivityLog, IBackofficeActivityLogParams>({
    fetcher,
    perPage: 15,
  });

  const handleApplyFilters = () => {
    setParams({
      status:
        (filters.statuses[0] as IBackofficeActivityLogParams["status"]) ??
        undefined,
      type:
        (filters.types[0] as IBackofficeActivityLogParams["type"]) ?? undefined,
    });
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setParams({
      status: undefined,
      type: undefined,
    });
  };

  if (!isMounted) return null;

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="Activity Logs"
          actions={
            <>
              <SearchInput
                value={searchQuery}
                onSearch={handleSearch}
                placeholder="Search activity logs..."
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-auto w-auto p-2.5"
                onClick={() => setFilterOpen(true)}
              >
                <ListFilter size={18} />
              </Button>
            </>
          }
        />

        <TableCardContent
          columns={columns}
          data={activityLogs}
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
        title="Filter Activity Logs"
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

        <FilterSection label="Type">
          <FilterChipGroup
            options={TYPE_OPTIONS}
            selected={filters.types}
            onChange={(types) => setFilters((prev) => ({ ...prev, types }))}
          />
        </FilterSection>
      </FilterPopup>
    </>
  );
}
