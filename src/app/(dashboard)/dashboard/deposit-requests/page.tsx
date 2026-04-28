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
  depositRequestsService,
  IDepositRequest,
  IDepositRequestParams,
} from "@services/backoffice/deposit-requests";
import { PATHS } from "@config/routing";

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Format a number as Indonesian Rupiah (e.g. Rp 500.000). */
const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

/** Format an ISO date string to Indonesian short date (e.g. 15 Jan 2025). */
const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ─── Badge Config ───────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  string,
  { variant: "warning" | "success" | "error" | "neutral"; label: string }
> = {
  pending: { variant: "warning", label: "Pending" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "error", label: "Rejected" },
  expired: { variant: "neutral", label: "Expired" },
};

// ─── Columns ────────────────────────────────────────────────────────────────────

const columns: TableColumn<IDepositRequest>[] = [
  {
    key: "client_name",
    header: "Client Name",
    render: (item) => (
      <TableCell>
        <Link
          href={PATHS.depositRequestDetail(item.id)}
          className="text-[15px] font-bold text-primary-600 hover:underline"
        >
          {item.user?.name ?? "—"}
        </Link>
      </TableCell>
    ),
  },
  {
    key: "reference_code",
    header: "Reference Code",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{item.reference_code}</p>
      </TableCell>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    render: (item) => (
      <TableCell>
        <p className="text-[15px] font-bold text-text-main">
          {formatRupiah(item.amount)}
        </p>
      </TableCell>
    ),
  },
  {
    key: "payment_method",
    header: "Payment Method",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{item.payment_method}</p>
      </TableCell>
    ),
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
    key: "created_at",
    header: "Created Date",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{formatDate(item.created_at)}</p>
      </TableCell>
    ),
  },
];

// ─── Filter Options ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" },
];

const PAYMENT_METHOD_OPTIONS = [
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "E-Wallet", value: "e_wallet" },
  { label: "QRIS", value: "qris" },
];

const DEFAULT_FILTERS = {
  statuses: [] as string[],
  paymentMethods: [] as string[],
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function DepositRequestsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const fetcher = useCallback(
    (params: IDepositRequestParams) => depositRequestsService.list(params),
    []
  );

  const {
    data: depositRequests,
    isInitialLoad,
    isRefetching,
    error,
    pagination,
    handlePageChange,
    handleSearch,
    searchQuery,
    isMounted,
    setParams,
  } = useTableData<IDepositRequest, IDepositRequestParams>({
    fetcher,
    perPage: 15,
  });

  const handleApplyFilters = () => {
    setParams({
      status:
        (filters.statuses[0] as IDepositRequestParams["status"]) ?? undefined,
      payment_method: filters.paymentMethods[0] ?? undefined,
    });
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setParams({
      status: undefined,
      payment_method: undefined,
    });
  };

  if (!isMounted) return null;

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="Deposit Requests"
          actions={
            <>
              <SearchInput
                value={searchQuery}
                onSearch={handleSearch}
                placeholder="Search by reference code or client name..."
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
          data={depositRequests}
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
        title="Filter Deposit Requests"
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

        <FilterSection label="Payment Method">
          <FilterChipGroup
            options={PAYMENT_METHOD_OPTIONS}
            selected={filters.paymentMethods}
            onChange={(paymentMethods) =>
              setFilters((prev) => ({ ...prev, paymentMethods }))
            }
          />
        </FilterSection>
      </FilterPopup>
    </>
  );
}
