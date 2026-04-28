"use client";

import React, { useCallback } from "react";
import { useUserProfile } from "@store/useUserProfile";
import {
  Target,
  TrendingUp,
  Trophy,
  FileText,
  Clock,
  Users,
} from "lucide-react";
import { StatCard } from "@app/components/ui/StatCard";
import {
  ChartCard,
  DonutChart,
  BarChartComponent,
  CHART_SETS,
} from "@app/components/ui/Chart";
import {
  FormCard,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";
import { Badge } from "@app/components/ui/Table";
import { useDetailData } from "@lib/hooks/use-detail-data";
import {
  salesDashboardService,
  ISalesDashboardData,
} from "@services/sales/dashboard";

const TYPE_LABELS: Record<string, string> = {
  general_note: "Catatan",
  request_lead_assign: "Assign Lead",
  request_update_lead_status: "Update Status",
};

const STATUS_VARIANT: Record<string, "warning" | "success" | "error"> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

const LEAD_STATUS_VARIANT: Record<
  string,
  "neutral" | "primary" | "success" | "error" | "warning" | "tertiary"
> = {
  new: "neutral",
  contacted: "primary",
  qualified: "tertiary",
  proposal: "warning",
  negotiation: "warning",
  won: "success",
  lost: "error",
};

const PRIORITY_VARIANT: Record<
  string,
  "neutral" | "primary" | "warning" | "error"
> = {
  low: "neutral",
  medium: "primary",
  high: "warning",
  urgent: "error",
};

export default function SalesDashboardPage() {
  const { profile, isLoading: isProfileLoading } = useUserProfile();

  const fetcher = useCallback(() => salesDashboardService.getDashboard(), []);
  const { data, isLoading, error } = useDetailData<ISalesDashboardData>({
    fetcher,
    enabled: !!profile,
  });

  if (isProfileLoading || !profile) {
    return (
      <FormCard>
        <FormCardLoading />
      </FormCard>
    );
  }

  if (isLoading) {
    return (
      <FormCard>
        <FormCardLoading />
      </FormCard>
    );
  }

  if (error || !data) {
    return (
      <FormCard>
        <FormCardError message={error || "Gagal memuat dashboard"} />
      </FormCard>
    );
  }

  const { leads, activities, recent_activities, recent_leads } = data;

  // --- Chart data ---
  const leadsBarData = [
    {
      name: "New",
      value: leads.by_status.new,
      color: CHART_SETS.mitraStatus[1],
    },
    {
      name: "Contacted",
      value: leads.by_status.contacted,
      color: CHART_SETS.verification[0],
    },
    {
      name: "Qualified",
      value: leads.by_status.qualified,
      color: CHART_SETS.mitraStatus[0],
    },
    {
      name: "Proposal",
      value: leads.by_status.proposal,
      color: CHART_SETS.mitraStatus[3],
    },
    {
      name: "Negotiation",
      value: leads.by_status.negotiation,
      color: CHART_SETS.verification[1],
    },
    {
      name: "Won",
      value: leads.by_status.won,
      color: CHART_SETS.mitraStatus[0],
    },
    {
      name: "Lost",
      value: leads.by_status.lost,
      color: CHART_SETS.mitraStatus[2],
    },
  ];

  const leadsTypePieData = [
    {
      name: "Client",
      value: leads.by_type.client,
      color: CHART_SETS.verification[0],
    },
    {
      name: "Mitra",
      value: leads.by_type.mitra,
      color: CHART_SETS.mitraStatus[3],
    },
  ];

  const activityStatusPieData = [
    {
      name: "Pending",
      value: activities.by_status.pending,
      color: CHART_SETS.mitraStatus[1],
    },
    {
      name: "Approved",
      value: activities.by_status.approved,
      color: CHART_SETS.mitraStatus[0],
    },
    {
      name: "Rejected",
      value: activities.by_status.rejected,
      color: CHART_SETS.mitraStatus[2],
    },
  ];

  const priorityBarData = [
    {
      name: "Low",
      value: leads.by_priority.low,
      color: CHART_SETS.mitraStatus[1],
    },
    {
      name: "Medium",
      value: leads.by_priority.medium,
      color: CHART_SETS.verification[0],
    },
    {
      name: "High",
      value: leads.by_priority.high,
      color: CHART_SETS.mitraStatus[3],
    },
    {
      name: "Urgent",
      value: leads.by_priority.urgent,
      color: CHART_SETS.mitraStatus[2],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads Saya"
          value={leads.total}
          description={`${leads.by_type.client} client · ${leads.by_type.mitra} mitra`}
          icon={Users}
          iconVariant="primary"
        />
        <StatCard
          title="Leads Aktif"
          value={leads.active}
          description="Dalam pipeline"
          icon={Target}
          iconVariant="warning"
        />
        <StatCard
          title="Leads Won"
          value={leads.won}
          description={`${leads.lost} lost`}
          icon={Trophy}
          iconVariant="success"
        />
        <StatCard
          title="Activity Bulan Ini"
          value={activities.this_month}
          description={`${activities.total} total · ${activities.by_status.pending} pending`}
          icon={FileText}
          iconVariant="tertiary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Leads Pipeline"
          description="Distribusi lead per tahap pipeline"
        >
          <BarChartComponent data={leadsBarData} />
        </ChartCard>

        <ChartCard
          title="Leads by Type"
          description="Proporsi lead client vs mitra"
        >
          <DonutChart data={leadsTypePieData} />
        </ChartCard>

        <ChartCard
          title="Status Activity Report"
          description="Distribusi status laporan aktivitas"
        >
          <DonutChart data={activityStatusPieData} />
        </ChartCard>

        <ChartCard
          title="Leads by Priority"
          description="Distribusi lead berdasarkan prioritas"
        >
          <BarChartComponent data={priorityBarData} />
        </ChartCard>
      </div>

      {/* Recent sections — side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Logs */}
        <div className="bg-bg-card rounded-2xl border border-border-subtle overflow-hidden">
          <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-main">
                Activity Terbaru
              </h3>
              <p className="text-[12px] text-text-muted mt-0.5">
                5 laporan aktivitas terakhir
              </p>
            </div>
            <Clock size={18} className="text-neutral-400" />
          </div>
          <div className="divide-y divide-border-subtle">
            {recent_activities.map((activity) => (
              <div
                key={activity.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-text-main truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[12px] text-text-muted">
                      {TYPE_LABELS[activity.type] ?? activity.type}
                    </span>
                    {activity.lead && (
                      <span className="text-[12px] text-text-muted">
                        · {activity.lead.lead_id}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Badge
                    variant={STATUS_VARIANT[activity.status] ?? "neutral"}
                    showDot={false}
                  >
                    {activity.status}
                  </Badge>
                  <span className="text-[11px] text-neutral-400">
                    {new Date(activity.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {recent_activities.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-text-muted">
                Belum ada activity
              </div>
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-bg-card rounded-2xl border border-border-subtle overflow-hidden">
          <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-main">
                Leads Terbaru
              </h3>
              <p className="text-[12px] text-text-muted mt-0.5">
                5 lead terakhir yang di-assign
              </p>
            </div>
            <TrendingUp size={18} className="text-neutral-400" />
          </div>
          <div className="divide-y divide-border-subtle">
            {recent_leads.map((lead) => (
              <div
                key={lead.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-text-main truncate">
                    {lead.name}
                  </p>
                  <span className="text-[12px] text-text-muted">
                    {lead.lead_id} · {lead.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Badge
                    variant={LEAD_STATUS_VARIANT[lead.status] ?? "neutral"}
                    showDot={false}
                  >
                    {lead.status}
                  </Badge>
                  <Badge
                    variant={PRIORITY_VARIANT[lead.priority] ?? "neutral"}
                    showDot={false}
                  >
                    {lead.priority}
                  </Badge>
                </div>
              </div>
            ))}
            {recent_leads.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-text-muted">
                Belum ada lead yang di-assign
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
