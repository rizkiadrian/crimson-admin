"use client";

import React, { useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Clock } from "lucide-react";
import { Button } from "@app/components/ui/Button";
import { FormInput } from "@app/components/ui/FormInput";
import {
  FormCard,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";
import {
  ChartCard,
  BarChartComponent,
  CHART_COLORS,
  CHART_SETS,
} from "@app/components/ui/Chart";
import { StatCard } from "@app/components/ui/StatCard";
import { useDetailData } from "@lib/hooks/use-detail-data";
import {
  analyticsService,
  type IFunnelStats,
  type IFunnelTrends,
  type IFunnelParams,
} from "@services/marketing/analytics";

// ─── Stage display config ────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  registered: "Registration",
  verified: "Verified",
  funded: "Funded",
  active: "Active",
};

const STAGE_COLORS: Record<string, string> = {
  registered: CHART_SETS.categorical[0],
  verified: CHART_SETS.categorical[1],
  funded: CHART_SETS.categorical[2],
  active: CHART_SETS.categorical[3],
};

// ─── Period options ──────────────────────────────────────────────────────────

type PeriodValue = "7d" | "30d" | "90d" | "custom";

const PERIOD_OPTIONS: { label: string; value: PeriodValue }[] = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "Custom", value: "custom" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function FunnelOverviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read period state from URL
  const period = (searchParams.get("period") as PeriodValue) || "30d";
  const dateFrom = searchParams.get("date_from") || "";
  const dateTo = searchParams.get("date_to") || "";

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
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [searchParams, router, pathname]
  );

  const handlePeriodChange = useCallback(
    (value: PeriodValue) => {
      if (value === "custom") {
        updateParams({ period: "custom" });
      } else {
        updateParams({ period: value, date_from: null, date_to: null });
      }
    },
    [updateParams]
  );

  const handleDateFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateParams({ date_from: e.target.value || null });
    },
    [updateParams]
  );

  const handleDateToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateParams({ date_to: e.target.value || null });
    },
    [updateParams]
  );

  // ─── Build API params ───────────────────────────────────────────────

  const apiParams: IFunnelParams = useMemo(() => {
    const params: IFunnelParams = { period };
    if (period === "custom") {
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
    }
    return params;
  }, [period, dateFrom, dateTo]);

  // ─── Fetch funnel stats ─────────────────────────────────────────────

  const statsFetcher = useCallback(
    () => analyticsService.getFunnelStats(apiParams),
    [apiParams]
  );

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDetailData<IFunnelStats>({ fetcher: statsFetcher });

  // ─── Fetch funnel trends ────────────────────────────────────────────

  const trendsFetcher = useCallback(
    () => analyticsService.getFunnelTrends(apiParams),
    [apiParams]
  );

  const {
    data: trends,
    isLoading: trendsLoading,
    error: trendsError,
  } = useDetailData<IFunnelTrends>({ fetcher: trendsFetcher });

  // ─── Prepare bar chart data ─────────────────────────────────────────

  const barData = useMemo(() => {
    if (!stats) return [];
    return stats.stages.map((s) => {
      const conversion = stats.conversions.find(
        (c) => c.from_stage === s.stage
      );
      const label = STAGE_LABELS[s.stage] || s.stage;
      const suffix = conversion ? ` (${conversion.rate.toFixed(1)}%)` : "";
      return {
        name: `${label}${suffix}`,
        value: s.count,
        color: STAGE_COLORS[s.stage] || CHART_COLORS.neutral,
      };
    });
  }, [stats]);

  // ─── Prepare trend line chart data ──────────────────────────────────

  const trendData = useMemo(() => {
    if (!trends) return [];
    return trends.labels.map((label, i) => {
      const point: Record<string, string | number> = { date: label };
      trends.series.forEach((s) => {
        point[s.stage] = s.data[i] ?? 0;
      });
      return point;
    });
  }, [trends]);

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Page header + period filter */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-main">Funnel Overview</h1>
          <p className="text-[13px] text-text-muted mt-1">
            User journey conversion funnel and trends
          </p>
        </div>

        {/* Period button group */}
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex rounded-xl border border-border-subtle overflow-hidden">
            {PERIOD_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={period === opt.value ? "primary" : "ghost"}
                size="sm"
                className="rounded-none border-0"
                onClick={() => handlePeriodChange(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Custom date range inputs */}
          {period === "custom" && (
            <div className="flex items-end gap-2">
              <FormInput
                id="date_from"
                label="From"
                format="date"
                inputSize="sm"
                value={dateFrom}
                onChange={handleDateFromChange}
                placeholder="Start date"
              />
              <FormInput
                id="date_to"
                label="To"
                format="date"
                inputSize="sm"
                value={dateTo}
                onChange={handleDateToChange}
                placeholder="End date"
              />
            </div>
          )}
        </div>
      </div>

      {/* Funnel Bar Chart */}
      {statsLoading ? (
        <FormCard>
          <FormCardLoading />
        </FormCard>
      ) : statsError ? (
        <FormCard>
          <FormCardError message={statsError} />
        </FormCard>
      ) : stats ? (
        <>
          <ChartCard
            title="Conversion Funnel"
            description="User counts per stage with conversion rates"
          >
            <BarChartComponent data={barData} height={300} />
          </ChartCard>

          {/* Average Time Per Stage */}
          {stats.average_time.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.average_time.map((t) => (
                <StatCard
                  key={t.stage}
                  title={STAGE_LABELS[t.stage] || t.stage}
                  value={formatHours(t.average_hours)}
                  description={`Avg time in ${(STAGE_LABELS[t.stage] || t.stage).toLowerCase()}`}
                  icon={Clock}
                  iconVariant="tertiary"
                />
              ))}
            </div>
          )}
        </>
      ) : null}

      {/* Trend Line Chart */}
      {trendsLoading ? (
        <FormCard>
          <FormCardLoading />
        </FormCard>
      ) : trendsError ? (
        <FormCard>
          <FormCardError message={trendsError} />
        </FormCard>
      ) : trends && trendData.length > 0 ? (
        <ChartCard
          title="Stage Trends"
          description="User counts per stage over time"
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 12,
                  fontWeight: 600,
                  fill: CHART_COLORS.label,
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: `1px solid ${CHART_COLORS.grid}`,
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              />
              <Legend />
              {trends.series.map((s) => (
                <Line
                  key={s.stage}
                  type="monotone"
                  dataKey={s.stage}
                  name={STAGE_LABELS[s.stage] || s.stage}
                  stroke={STAGE_COLORS[s.stage] || CHART_COLORS.neutral}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : null}
    </div>
  );
}
