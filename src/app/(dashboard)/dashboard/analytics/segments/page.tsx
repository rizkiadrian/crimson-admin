"use client";

import React, { useCallback, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Download,
  ListFilter,
  Users,
  UserCheck,
  Wallet,
  Zap,
  Moon,
  UserX,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import {
  TableCard,
  TableCardHeader,
  TableCardContent,
  TableCardPagination,
  TableCell,
} from "@app/components/ui/Table";
import type { TableColumn } from "@app/components/ui/Table";
import { Button } from "@app/components/ui/Button";
import {
  FilterPopup,
  FilterSection,
  FilterDateRange,
} from "@app/components/ui/FilterPopup";
import {
  FormCard,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";
import { ChartCard, DonutChart, CHART_COLORS } from "@app/components/ui/Chart";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { useTableData } from "@lib/hooks/use-table-data";
import { useNotificationStore } from "@store/useNotificationStore";
import { cn } from "@lib/utils";
import {
  analyticsService,
  type ISegmentSummary,
  type ISegmentUser,
  type ISegmentUsersParams,
} from "@services/marketing/analytics";

// ─── Stage display config ────────────────────────────────────────────────────

const STAGE_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{
      size?: number;
      strokeWidth?: number;
      className?: string;
    }>;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    dotColor: string;
    chartColor: string;
  }
> = {
  registered: {
    label: "Registered",
    icon: UserPlus,
    color: "text-neutral-600",
    bgColor: "bg-neutral-50",
    borderColor: "border-neutral-200",
    textColor: "text-neutral-700",
    dotColor: "bg-neutral-400",
    chartColor: CHART_COLORS.neutral,
  },
  verified: {
    label: "Verified",
    icon: UserCheck,
    color: "text-primary-600",
    bgColor: "bg-primary-50",
    borderColor: "border-primary-200",
    textColor: "text-primary-700",
    dotColor: "bg-primary-500",
    chartColor: CHART_COLORS.primary,
  },
  funded: {
    label: "Funded",
    icon: Wallet,
    color: "text-tertiary-600",
    bgColor: "bg-tertiary-50",
    borderColor: "border-tertiary-200",
    textColor: "text-tertiary-700",
    dotColor: "bg-tertiary-500",
    chartColor: CHART_COLORS.tertiary,
  },
  active: {
    label: "Active",
    icon: Zap,
    color: "text-success-600",
    bgColor: "bg-success-50",
    borderColor: "border-success-200",
    textColor: "text-success-700",
    dotColor: "bg-success-500",
    chartColor: CHART_COLORS.success,
  },
  dormant: {
    label: "Dormant",
    icon: Moon,
    color: "text-warning-600",
    bgColor: "bg-warning-50",
    borderColor: "border-warning-200",
    textColor: "text-warning-700",
    dotColor: "bg-warning-500",
    chartColor: CHART_COLORS.warning,
  },
  churned: {
    label: "Churned",
    icon: UserX,
    color: "text-error-600",
    bgColor: "bg-error-50",
    borderColor: "border-error-200",
    textColor: "text-error-700",
    dotColor: "bg-error-500",
    chartColor: "#9ca3af",
  },
};

const STAGE_ORDER = [
  "registered",
  "verified",
  "funded",
  "active",
  "dormant",
  "churned",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ─── Columns ─────────────────────────────────────────────────────────────────

const columns: TableColumn<ISegmentUser>[] = [
  {
    key: "name",
    header: "Name",
    render: (item) => (
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600 shrink-0">
            {item.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-text-main">
              {item.name}
            </p>
            <p className="text-xs text-text-muted">{item.email}</p>
          </div>
        </div>
      </TableCell>
    ),
  },
  {
    key: "phone",
    header: "Phone",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{item.phone ?? "—"}</p>
      </TableCell>
    ),
  },
  {
    key: "created_at",
    header: "Registered",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{formatDate(item.created_at)}</p>
      </TableCell>
    ),
  },
  {
    key: "last_event_at",
    header: "Last Active",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">
          {item.last_event_at ? formatDate(item.last_event_at) : "—"}
        </p>
      </TableCell>
    ),
  },
];

// ─── Filter defaults ─────────────────────────────────────────────────────────

const DEFAULT_FILTERS = {
  registration_date_from: "",
  registration_date_to: "",
  last_active_from: "",
  last_active_to: "",
};

// ─── Segment Card Component ─────────────────────────────────────────────────

function SegmentCard({
  stage,
  count,
  total,
  isSelected,
  onClick,
}: {
  stage: string;
  count: number;
  total: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const cfg = STAGE_CONFIG[stage];
  if (!cfg) return null;

  const Icon = cfg.icon;
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Select ${cfg.label} stage`}
      className={cn(
        "group relative text-left rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer w-full",
        "hover:shadow-md hover:-translate-y-0.5",
        isSelected
          ? `${cfg.borderColor} ${cfg.bgColor} shadow-md -translate-y-0.5`
          : "border-border-subtle bg-bg-card hover:border-neutral-300"
      )}
    >
      {/* Icon + Label row */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
            isSelected
              ? cfg.bgColor
              : "bg-neutral-50 group-hover:bg-neutral-100"
          )}
        >
          <Icon
            size={18}
            strokeWidth={2}
            className={cn(
              "transition-colors",
              isSelected
                ? cfg.color
                : "text-neutral-400 group-hover:text-neutral-600"
            )}
          />
        </div>
        {isSelected && (
          <ArrowRight size={16} className={cn(cfg.color, "animate-pulse")} />
        )}
      </div>

      {/* Count */}
      <p
        className={cn(
          "text-2xl font-bold tracking-tight mb-0.5",
          isSelected ? cfg.textColor : "text-text-main"
        )}
      >
        {count.toLocaleString()}
      </p>

      {/* Label */}
      <p className="text-[12px] font-medium text-text-muted mb-3">
        {cfg.label}
      </p>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isSelected ? "" : "bg-neutral-300"
          )}
          style={{
            width: `${Math.max(percentage, 2)}%`,
            backgroundColor: isSelected ? cfg.chartColor : undefined,
          }}
        />
      </div>
      <p className="text-[11px] text-text-muted mt-1.5">
        {percentage.toFixed(1)}% of total
      </p>
    </button>
  );
}

// ─── Users Table Sub-Component ───────────────────────────────────────────────

function SegmentUsersTable({
  stage,
  onExport,
  isExporting,
}: {
  stage: string;
  onExport: () => void;
  isExporting: boolean;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const cfg = STAGE_CONFIG[stage];

  const usersFetcher = useCallback(
    (params: ISegmentUsersParams) =>
      analyticsService.getSegmentUsers(stage, params),
    [stage]
  );

  const {
    data: users,
    isInitialLoad,
    isRefetching,
    error: usersError,
    pagination,
    handlePageChange,
    setParams,
  } = useTableData<ISegmentUser, ISegmentUsersParams>({
    fetcher: usersFetcher,
    perPage: 15,
    initialParams: {
      stage,
      registration_date_from:
        searchParams.get("registration_date_from") || undefined,
      registration_date_to:
        searchParams.get("registration_date_to") || undefined,
      last_active_from: searchParams.get("last_active_from") || undefined,
      last_active_to: searchParams.get("last_active_to") || undefined,
    } as Omit<ISegmentUsersParams, "page" | "per_page">,
  });

  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const handleApplyFilters = () => {
    const filterParams: Partial<ISegmentUsersParams> = {};
    if (filters.registration_date_from)
      filterParams.registration_date_from = filters.registration_date_from;
    if (filters.registration_date_to)
      filterParams.registration_date_to = filters.registration_date_to;
    if (filters.last_active_from)
      filterParams.last_active_from = filters.last_active_from;
    if (filters.last_active_to)
      filterParams.last_active_to = filters.last_active_to;

    setParams(filterParams);
    updateUrlParams({
      registration_date_from: filters.registration_date_from || null,
      registration_date_to: filters.registration_date_to || null,
      last_active_from: filters.last_active_from || null,
      last_active_to: filters.last_active_to || null,
    });
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setParams({
      registration_date_from: undefined,
      registration_date_to: undefined,
      last_active_from: undefined,
      last_active_to: undefined,
    });
    updateUrlParams({
      registration_date_from: null,
      registration_date_to: null,
      last_active_from: null,
      last_active_to: null,
    });
  };

  return (
    <>
      <TableCard>
        <TableCardHeader
          title={`${cfg?.label || stage} Users`}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-auto w-auto p-2.5"
                onClick={() => setFilterOpen(true)}
                aria-label="Filter"
              >
                <ListFilter size={18} />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onExport}
                disabled={isExporting}
                aria-label="Export CSV"
              >
                <Download size={16} className="mr-1.5" />
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          }
        />

        <TableCardContent
          columns={columns}
          data={users}
          keyExtractor={(item) => item.id}
          isRefetching={isRefetching}
          isLoading={isInitialLoad}
          error={usersError}
        />

        <TableCardPagination
          pagination={pagination}
          isInitialLoad={isInitialLoad}
          error={usersError}
          onPageChange={handlePageChange}
        />
      </TableCard>

      <FilterPopup
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Segment Users"
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
        <FilterSection label="Registration Date">
          <FilterDateRange
            startDate={filters.registration_date_from}
            endDate={filters.registration_date_to}
            onStartDateChange={(date) =>
              setFilters((prev) => ({
                ...prev,
                registration_date_from: date,
              }))
            }
            onEndDateChange={(date) =>
              setFilters((prev) => ({
                ...prev,
                registration_date_to: date,
              }))
            }
            startPlaceholder="From"
            endPlaceholder="To"
          />
        </FilterSection>

        <FilterSection label="Last Active Date">
          <FilterDateRange
            startDate={filters.last_active_from}
            endDate={filters.last_active_to}
            onStartDateChange={(date) =>
              setFilters((prev) => ({
                ...prev,
                last_active_from: date,
              }))
            }
            onEndDateChange={(date) =>
              setFilters((prev) => ({
                ...prev,
                last_active_to: date,
              }))
            }
            startPlaceholder="From"
            endPlaceholder="To"
          />
        </FilterSection>
      </FilterPopup>
    </>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function UserSegmentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const selectedStage = searchParams.get("stage") || "";
  const [isExporting, setIsExporting] = useState(false);

  // ─── URL sync helper ────────────────────────────────────────────────

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // ─── Fetch segment summary ─────────────────────────────────────────

  const summaryFetcher = useCallback(
    () => analyticsService.getSegmentSummary(),
    []
  );

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useDetailData<ISegmentSummary>({ fetcher: summaryFetcher });

  // ─── Stage selection ────────────────────────────────────────────────

  const handleStageClick = useCallback(
    (stage: string) => {
      if (selectedStage === stage) {
        // Deselect
        updateParams({ stage: null });
      } else {
        updateParams({ stage });
      }
    },
    [selectedStage, updateParams]
  );

  // ─── CSV export ─────────────────────────────────────────────────────

  const handleExportCsv = useCallback(async () => {
    if (!selectedStage) return;
    setIsExporting(true);
    try {
      const blob = await analyticsService.exportSegmentCsv({
        stage: selectedStage,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `segment-${selectedStage}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      showNotification("Failed to export CSV", "error");
    } finally {
      setIsExporting(false);
    }
  }, [selectedStage, showNotification]);

  // ─── Donut chart data ───────────────────────────────────────────────

  const donutData =
    summary?.stages.map((s) => ({
      name: STAGE_CONFIG[s.stage]?.label || s.stage,
      value: s.count,
      color: STAGE_CONFIG[s.stage]?.chartColor || CHART_COLORS.neutral,
    })) ?? [];

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-text-main">User Segments</h1>
        <p className="text-[13px] text-text-muted mt-1">
          Explore users grouped by their journey stage
        </p>
      </div>

      {summaryLoading ? (
        <FormCard>
          <FormCardLoading />
        </FormCard>
      ) : summaryError ? (
        <FormCard>
          <FormCardError message={summaryError} />
        </FormCard>
      ) : summary ? (
        <>
          {/* Top row: Total users card + Donut chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total users summary */}
            <div className="bg-bg-card rounded-2xl border border-border-subtle p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <Users
                      size={20}
                      strokeWidth={1.5}
                      className="text-primary-500"
                    />
                  </div>
                  <div>
                    <p className="text-[12px] text-text-muted font-medium uppercase tracking-wide">
                      Total Users
                    </p>
                    <p className="text-3xl font-bold text-text-main tracking-tight">
                      {summary.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Mini stage breakdown */}
                <div className="space-y-2.5 mt-4">
                  {summary.stages
                    .filter((s) =>
                      ["active", "dormant", "churned"].includes(s.stage)
                    )
                    .map((s) => {
                      const cfg = STAGE_CONFIG[s.stage];
                      if (!cfg) return null;
                      const pct =
                        summary.total > 0
                          ? ((s.count / summary.total) * 100).toFixed(1)
                          : "0";
                      return (
                        <div
                          key={s.stage}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full",
                                cfg.dotColor
                              )}
                            />
                            <span className="text-[13px] text-text-muted">
                              {cfg.label}
                            </span>
                          </div>
                          <span className="text-[13px] font-semibold text-text-main">
                            {s.count.toLocaleString()}{" "}
                            <span className="text-text-muted font-normal">
                              ({pct}%)
                            </span>
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Donut chart */}
            <ChartCard
              title="Stage Distribution"
              description="User distribution across all journey stages"
              className="lg:col-span-2"
            >
              <DonutChart
                data={donutData}
                height={220}
                innerRadius={55}
                outerRadius={90}
              />
            </ChartCard>
          </div>

          {/* Stage cards grid */}
          <div>
            <p className="text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-3">
              Select a stage to view users
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {STAGE_ORDER.map((stage) => {
                const stageData = summary.stages.find((s) => s.stage === stage);
                return (
                  <SegmentCard
                    key={stage}
                    stage={stage}
                    count={stageData?.count ?? 0}
                    total={summary.total}
                    isSelected={selectedStage === stage}
                    onClick={() => handleStageClick(stage)}
                  />
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      {/* User table — only rendered when a stage is selected */}
      {selectedStage && (
        <SegmentUsersTable
          key={selectedStage}
          stage={selectedStage}
          onExport={handleExportCsv}
          isExporting={isExporting}
        />
      )}
    </div>
  );
}
