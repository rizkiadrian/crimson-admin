"use client";

import {
  Plus,
  ListFilter,
  Pencil,
  Trash2,
  ArrowRightLeft,
  ChevronDown,
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
import { useTableData } from "@lib/hooks/use-table-data";
import {
  leadsService,
  ILead,
  ILeadParams,
  LeadStatus,
} from "@services/backoffice/leads";
import { getNameInitials } from "@lib/utils";
import { PATHS } from "@config/routing";
import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useConfirmStore } from "@store/useConfirmStore";
import { useNotificationStore } from "@store/useNotificationStore";
import { SearchInput } from "@app/components/ui/SearchInput";
import { ConvertLeadModal } from "../convert-lead-modal";

// ─── Badge helpers ────────────────────────────────────────────────────────────

type BadgeVariant =
  | "primary"
  | "tertiary"
  | "success"
  | "warning"
  | "error"
  | "neutral";

const STATUS_BADGE: Record<LeadStatus, BadgeVariant> = {
  new: "neutral",
  contacted: "primary",
  qualified: "tertiary",
  proposal: "warning",
  negotiation: "primary",
  won: "success",
  lost: "error",
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

const PRIORITY_BADGE: Record<string, BadgeVariant> = {
  low: "neutral",
  medium: "warning",
  high: "error",
  urgent: "error",
};

// ─── Column definitions ───────────────────────────────────────────────────────

const getColumns = (onRefetch: () => void): TableColumn<ILead>[] => [
  {
    key: "name",
    header: "Name",
    render: (lead) => (
      <TableCell>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-600 shrink-0">
            {getNameInitials(lead.name)}
          </div>
          <div>
            <p className="text-[15px] font-bold text-text-main">{lead.name}</p>
            {lead.email && (
              <p className="text-[12px] text-text-muted">{lead.email}</p>
            )}
          </div>
        </div>
      </TableCell>
    ),
  },
  {
    key: "type",
    header: "Type",
    render: (lead) => (
      <TableCell>
        <Badge
          variant={lead.type === "client" ? "primary" : "tertiary"}
          showDot={false}
        >
          {lead.type}
        </Badge>
      </TableCell>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (lead) => (
      <TableCell>
        <Badge variant={STATUS_BADGE[lead.status]}>
          {STATUS_LABELS[lead.status]}
        </Badge>
      </TableCell>
    ),
  },
  {
    key: "priority",
    header: "Priority",
    render: (lead) => (
      <TableCell>
        <Badge variant={PRIORITY_BADGE[lead.priority]} showDot={false}>
          {lead.priority}
        </Badge>
      </TableCell>
    ),
  },
  {
    key: "source",
    header: "Source",
    render: (lead) => (
      <TableCell>
        <p className="text-[14px] text-text-muted">{lead.source}</p>
      </TableCell>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    render: (lead) => (
      <TableCell>
        <LeadActions lead={lead} onRefetch={onRefetch} />
      </TableCell>
    ),
  },
];

// ─── Action buttons ───────────────────────────────────────────────────────────

const STATUS_OPTIONS: { label: string; value: LeadStatus }[] = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Proposal", value: "proposal" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
];

function LeadActions({
  lead,
  onRefetch,
}: {
  lead: ILead;
  onRefetch: () => void;
}) {
  const searchParams = useSearchParams();
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [convertOpen, setConvertOpen] = useState(false);
  const [statusDropOpen, setStatusDropOpen] = useState(false);

  const currentPage = searchParams.get("page");
  const editHref = currentPage
    ? `${PATHS.leadsEdit(lead.id)}?returnPage=${currentPage}`
    : PATHS.leadsEdit(lead.id);

  const handleStatusChange = (status: LeadStatus) => {
    setStatusDropOpen(false);
    showConfirm({
      title: `Update status ke "${STATUS_LABELS[status]}"?`,
      description: `Status lead "${lead.name}" akan diubah dari "${STATUS_LABELS[lead.status]}" menjadi "${STATUS_LABELS[status]}".`,
      confirmLabel: "Update",
      cancelLabel: "Batal",
      onConfirm: async () => {
        try {
          const resp = await leadsService.leadsUpdateStatus(lead.id, {
            status,
          });
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal update status lead",
            "error"
          );
          throw err;
        }
      },
    });
  };

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Lead?",
      description: `Lead "${lead.name}" akan dihapus secara permanen dari sistem.`,
      onConfirm: async () => {
        try {
          const resp = await leadsService.leadsDelete(lead.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(apiError.message || "Gagal menghapus lead", "error");
          throw err;
        }
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
        {/* Status update dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
            aria-label="Update Status"
            onClick={() => setStatusDropOpen((v) => !v)}
          >
            <ChevronDown size={16} />
          </Button>
          {statusDropOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setStatusDropOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-border-subtle rounded-xl shadow-lg overflow-hidden min-w-36 py-1">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className="w-full text-left px-4 py-2 text-[13px] font-medium text-text-main hover:bg-neutral-50 transition-colors disabled:opacity-40"
                    disabled={opt.value === lead.status}
                  >
                    {opt.label}
                    {opt.value === lead.status && (
                      <span className="ml-2 text-[10px] text-primary-500 font-bold">
                        ●
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Convert */}
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-2 rounded-lg hover:text-success-600 hover:bg-success-50 hover:border-transparent"
          aria-label="Convert Lead"
          onClick={() => setConvertOpen(true)}
        >
          <ArrowRightLeft size={16} />
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

      <ConvertLeadModal
        open={convertOpen}
        leadId={lead.id}
        leadName={lead.name}
        onClose={() => setConvertOpen(false)}
        onConverted={onRefetch}
      />
    </>
  );
}

// ─── Filter options ───────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { label: "Client", value: "client" },
  { label: "Mitra", value: "mitra" },
];

const FILTER_STATUS_OPTIONS = STATUS_OPTIONS.map((o) => ({
  label: o.label,
  value: o.value as string,
}));

const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

const DEFAULT_FILTERS = {
  types: [] as string[],
  statuses: [] as string[],
  priorities: [] as string[],
};

// ─── Table component ──────────────────────────────────────────────────────────

/** Paginated, filterable leads table with CRUD actions. */
export function LeadTable() {
  const fetcher = useCallback(
    (params: ILeadParams) => leadsService.leads(params),
    []
  );

  const {
    data: leads,
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
  } = useTableData<ILead, ILeadParams>({
    fetcher,
    perPage: 10,
  });

  const columns = getColumns(refetch);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const handleApplyFilters = () => {
    setParams({
      type: filters.types.length > 0 ? filters.types.join(",") : undefined,
      status:
        filters.statuses.length > 0 ? filters.statuses.join(",") : undefined,
      priority:
        filters.priorities.length > 0
          ? filters.priorities.join(",")
          : undefined,
    });
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setParams({
      type: undefined,
      status: undefined,
      priority: undefined,
    });
  };

  if (!isMounted) return null;

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="Leads"
          actions={
            <>
              <SearchInput
                value={searchQuery}
                onSearch={handleSearch}
                placeholder="Search leads..."
              />
              <Button
                variant="primary"
                href={PATHS.leadsCreate}
                className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Lead
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
          data={leads}
          keyExtractor={(lead) => lead.id}
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
        title="Filter Leads"
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

        <FilterSection label="Pipeline Status">
          <FilterChipGroup
            options={FILTER_STATUS_OPTIONS}
            selected={filters.statuses}
            onChange={(statuses) =>
              setFilters((prev) => ({ ...prev, statuses }))
            }
          />
        </FilterSection>

        <FilterSection label="Priority">
          <FilterChipGroup
            options={PRIORITY_OPTIONS}
            selected={filters.priorities}
            onChange={(priorities) =>
              setFilters((prev) => ({ ...prev, priorities }))
            }
          />
        </FilterSection>
      </FilterPopup>
    </>
  );
}
