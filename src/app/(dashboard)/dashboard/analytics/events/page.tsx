"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { ListFilter, X, Copy, Check } from "lucide-react";
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
  FilterDateRange,
} from "@app/components/ui/FilterPopup";
import { SearchInput } from "@app/components/ui/SearchInput";
import { useTableData } from "@lib/hooks/use-table-data";
import {
  analyticsService,
  type IUserEvent,
  type IEventLogParams,
} from "@services/marketing/analytics";

// ─── Event type display config ───────────────────────────────────────────────

const EVENT_TYPE_BADGE: Record<
  string,
  {
    variant:
      | "primary"
      | "tertiary"
      | "success"
      | "warning"
      | "error"
      | "neutral";
    label: string;
  }
> = {
  user_registered: { variant: "primary", label: "Registered" },
  email_verified: { variant: "success", label: "Email Verified" },
  first_deposit: { variant: "tertiary", label: "First Deposit" },
  first_transaction: { variant: "success", label: "First Transaction" },
  app_opened: { variant: "neutral", label: "App Opened" },
  banner_clicked: { variant: "warning", label: "Banner Clicked" },
  service_viewed: { variant: "neutral", label: "Service Viewed" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTimestamp = (date: string): string =>
  new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function truncateJson(
  metadata: Record<string, unknown> | null,
  maxLength = 50
): string {
  if (!metadata) return "—";
  const json = JSON.stringify(metadata);
  if (json.length <= maxLength) return json;
  return json.slice(0, maxLength) + "…";
}

// ─── Metadata Popover ────────────────────────────────────────────────────────

function MetadataPopover({
  metadata,
}: {
  metadata: Record<string, unknown> | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Determine if popover should open above or below
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    // Open above only if there's not enough space below (< 280px) and more space above
    queueMicrotask(() => {
      setOpenAbove(spaceBelow < 280 && spaceAbove > spaceBelow);
    });
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  if (!metadata) {
    return <span className="text-xs text-text-muted font-mono">—</span>;
  }

  const fullJson = JSON.stringify(metadata, null, 2);
  const truncated = truncateJson(metadata);
  const isLong = JSON.stringify(metadata).length > 50;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`text-xs font-mono text-left max-w-xs truncate block transition-colors ${
          isLong
            ? "text-primary-600 hover:text-primary-700 cursor-pointer underline decoration-dotted underline-offset-2"
            : "text-text-muted cursor-pointer hover:text-text-main"
        }`}
      >
        {truncated}
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 right-0 w-80 max-w-[90vw] bg-bg-card rounded-xl border border-border-subtle shadow-xl ${
            openAbove ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle">
            <span className="text-xs font-semibold text-text-main uppercase tracking-wide">
              Metadata
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-neutral-100 transition-colors"
                title="Copy JSON"
              >
                {copied ? (
                  <Check size={14} className="text-success-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-neutral-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* JSON content */}
          <div className="p-4 max-h-64 overflow-auto">
            <pre className="text-xs font-mono text-text-main whitespace-pre-wrap break-words leading-relaxed">
              {fullJson}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Columns ─────────────────────────────────────────────────────────────────

const columns: TableColumn<IUserEvent>[] = [
  {
    key: "user",
    header: "User",
    render: (item) => (
      <TableCell>
        <p className="text-[15px] font-bold text-text-main">
          {item.user?.name ?? "—"}
        </p>
        <p className="text-xs text-text-muted">{item.user?.email ?? ""}</p>
      </TableCell>
    ),
  },
  {
    key: "event_type",
    header: "Event Type",
    render: (item) => {
      const cfg = EVENT_TYPE_BADGE[item.event_type] ?? {
        variant: "neutral" as const,
        label: item.event_type,
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
    header: "Timestamp",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">
          {formatTimestamp(item.created_at)}
        </p>
      </TableCell>
    ),
  },
  {
    key: "metadata",
    header: "Metadata",
    render: (item) => (
      <TableCell>
        <MetadataPopover metadata={item.metadata} />
      </TableCell>
    ),
  },
];

// ─── Filter Options ──────────────────────────────────────────────────────────

const EVENT_TYPE_OPTIONS = [
  { label: "Registered", value: "user_registered" },
  { label: "Email Verified", value: "email_verified" },
  { label: "First Deposit", value: "first_deposit" },
  { label: "First Transaction", value: "first_transaction" },
  { label: "App Opened", value: "app_opened" },
  { label: "Banner Clicked", value: "banner_clicked" },
  { label: "Service Viewed", value: "service_viewed" },
];

const DEFAULT_FILTERS = {
  eventTypes: [] as string[],
  date_from: "",
  date_to: "",
};

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function EventLogPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const fetcher = useCallback(
    (params: IEventLogParams) => analyticsService.getEventLog(params),
    []
  );

  const {
    data: events,
    isInitialLoad,
    isRefetching,
    error,
    pagination,
    handlePageChange,
    handleSearch,
    searchQuery,
    isMounted,
    setParams,
  } = useTableData<IUserEvent, IEventLogParams>({
    fetcher,
    perPage: 15,
  });

  // ─── Filter handlers ───────────────────────────────────────────────

  const handleApplyFilters = () => {
    setParams({
      event_type: filters.eventTypes[0] ?? undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
    });
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setParams({
      event_type: undefined,
      date_from: undefined,
      date_to: undefined,
    });
  };

  if (!isMounted) return null;

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="Event Log"
          actions={
            <>
              <SearchInput
                value={searchQuery}
                onSearch={handleSearch}
                placeholder="Search by user name or email..."
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
          data={events}
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
        title="Filter Events"
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
        <FilterSection label="Event Type">
          <FilterChipGroup
            options={EVENT_TYPE_OPTIONS}
            selected={filters.eventTypes}
            onChange={(eventTypes) =>
              setFilters((prev) => ({ ...prev, eventTypes }))
            }
          />
        </FilterSection>

        <FilterSection label="Date Range">
          <FilterDateRange
            startDate={filters.date_from}
            endDate={filters.date_to}
            onStartDateChange={(date) =>
              setFilters((prev) => ({ ...prev, date_from: date }))
            }
            onEndDateChange={(date) =>
              setFilters((prev) => ({ ...prev, date_to: date }))
            }
            startPlaceholder="From"
            endPlaceholder="To"
          />
        </FilterSection>
      </FilterPopup>
    </>
  );
}
