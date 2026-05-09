"use client";

import React, { useCallback } from "react";
import { useUserProfile } from "@store/useUserProfile";
import { Users, Wrench, TrendingUp, ShieldCheck } from "lucide-react";
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
import { useDetailData } from "@lib/hooks/use-detail-data";
import {
  backofficeDashboardService,
  IBackofficeDashboardData,
} from "@services/backoffice/backoffice-dashboard";

export default function BackofficeDashboardPage() {
  const { profile, isLoading: isProfileLoading } = useUserProfile();

  const fetcher = useCallback(
    () => backofficeDashboardService.getDashboard(),
    []
  );
  const { data, isLoading, error } = useDetailData<IBackofficeDashboardData>({
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

  const {
    clients,
    mitra,
    leads,
    pending_activity_logs,
    pending_verifications,
  } = data;

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

  const leadsBarData = Object.entries(leads.by_status).map(
    ([key, value], i) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      color: CHART_SETS.mitraStatus[i % CHART_SETS.mitraStatus.length],
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Welcome back, {profile.name}
        </h1>
        <p className="text-neutral-500 mt-1">Backoffice Dashboard Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value={clients.total}
          icon={Users}
          description={`${clients.verified} verified`}
        />
        <StatCard
          title="Total Mitra"
          value={mitra.total}
          icon={Wrench}
          description={`${mitra.pending_verification} pending`}
        />
        <StatCard title="Active Leads" value={leads.total} icon={TrendingUp} />
        <StatCard
          title="Pending Verifications"
          value={mitra.pending_verification}
          icon={ShieldCheck}
          description="Mitra"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Client Verification Status">
          <DonutChart data={clientPieData} />
        </ChartCard>
        <ChartCard title="Lead Pipeline">
          <BarChartComponent data={leadsBarData} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormCard>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">
              Pending Activity Logs
            </h3>
            <div className="space-y-3">
              {pending_activity_logs.length === 0 && (
                <p className="text-sm text-neutral-500">No pending items</p>
              )}
              {pending_activity_logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {log.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-neutral-500">{log.sales_name}</p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FormCard>

        <FormCard>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">
              Mitra Verification Queue
            </h3>
            <div className="space-y-3">
              {pending_verifications.length === 0 && (
                <p className="text-sm text-neutral-500">No pending items</p>
              )}
              {pending_verifications.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-500 capitalize">
                      {item.type}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FormCard>
      </div>
    </div>
  );
}
