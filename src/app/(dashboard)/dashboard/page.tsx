"use client";

import React, { useCallback } from "react";
import { useUserProfile } from "@store/useUserProfile";
import {
  Users,
  ShieldCheck,
  Wrench,
  Clock,
  TrendingUp,
  Wallet,
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
  dashboardService,
  IDashboardData,
} from "@services/backoffice/dashboard";
import { getNameInitials } from "@lib/utils";

export default function DashboardPage() {
  const { profile, isLoading: isProfileLoading } = useUserProfile();

  const fetcher = useCallback(() => dashboardService.getDashboard(), []);
  const { data, isLoading, error } = useDetailData<IDashboardData>({
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
        <FormCardError message={error || "Failed to load dashboard"} />
      </FormCard>
    );
  }

  const { clients, mitra, leads, deposits, recent_backoffice } = data;

  const clientPieData = [
    {
      name: "Verified",
      value: clients.verified,
      color: CHART_SETS.verification[0],
    },
    {
      name: "Unverified",
      value: clients.unverified,
      color: CHART_SETS.verification[1],
    },
  ];

  const mitraBarData = [
    {
      name: "Approved",
      value: mitra.approved,
      color: CHART_SETS.mitraStatus[0],
    },
    { name: "Pending", value: mitra.pending, color: CHART_SETS.mitraStatus[1] },
    {
      name: "Rejected",
      value: mitra.rejected,
      color: CHART_SETS.mitraStatus[2],
    },
    {
      name: "Suspended",
      value: mitra.suspended,
      color: CHART_SETS.mitraStatus[3],
    },
  ];

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

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value={clients.total}
          description={`${clients.verified} verified`}
          icon={Users}
          iconVariant="primary"
        />
        <StatCard
          title="Verified Clients"
          value={clients.verified}
          description={`${clients.unverified} pending verification`}
          icon={ShieldCheck}
          iconVariant="success"
        />
        <StatCard
          title="Total Mitra"
          value={mitra.total}
          description={`${mitra.online} currently online`}
          icon={Wrench}
          iconVariant="tertiary"
        />
        <StatCard
          title="Total Leads"
          value={leads.total}
          description={`${leads.by_status.won} won · ${leads.by_type.client} client · ${leads.by_type.mitra} mitra`}
          icon={TrendingUp}
          iconVariant="primary"
        />
        <StatCard
          title="Deposit Requests"
          value={deposits.total}
          description={`${deposits.pending} pending review`}
          icon={Wallet}
          iconVariant="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Client Verification"
          description="Distribution of verified vs unverified clients"
        >
          <DonutChart data={clientPieData} />
        </ChartCard>

        <ChartCard
          title="Mitra Verification Status"
          description="Breakdown by verification status"
        >
          <BarChartComponent data={mitraBarData} />
        </ChartCard>

        <ChartCard
          title="Leads Pipeline"
          description="Leads distribution across pipeline stages"
        >
          <BarChartComponent data={leadsBarData} />
        </ChartCard>

        <ChartCard
          title="Mitra Online Status"
          description="Currently online vs total approved mitra"
        >
          <DonutChart
            data={[
              {
                name: "Online",
                value: mitra.online,
                color: CHART_SETS.mitraStatus[0],
              },
              {
                name: "Offline",
                value: mitra.approved - mitra.online,
                color: CHART_SETS.mitraStatus[1],
              },
            ]}
          />
        </ChartCard>
      </div>

      {/* Recent Backoffice Members */}
      <div className="bg-bg-card rounded-2xl border border-border-subtle overflow-hidden">
        <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-main">
              Recent Backoffice Activity
            </h3>
            <p className="text-[12px] text-text-muted mt-0.5">
              Last 5 active backoffice members
            </p>
          </div>
          <Clock size={18} className="text-neutral-400" />
        </div>
        <div className="divide-y divide-border-subtle">
          {recent_backoffice.map((member) => (
            <div
              key={member.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-600">
                  {getNameInitials(member.name)}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-text-main">
                    {member.name}
                  </p>
                  <p className="text-[12px] text-text-muted">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    member.role_name === "Admin" ? "primary" : "tertiary"
                  }
                  showDot={false}
                >
                  {member.role_name}
                </Badge>
                <span className="text-[11px] text-neutral-400">
                  {new Date(member.updated_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          ))}
          {recent_backoffice.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-text-muted">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
