"use client";

import React, { useCallback } from "react";
import { useUserProfile } from "@store/useUserProfile";
import { Clock, CheckCircle, XCircle, Wallet } from "lucide-react";
import { StatCard } from "@app/components/ui/StatCard";
import {
  ChartCard,
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
  financeDashboardService,
  IFinanceDashboardData,
} from "@services/finance/dashboard";

export default function FinanceDashboardPage() {
  const { profile, isLoading: isProfileLoading } = useUserProfile();

  const fetcher = useCallback(() => financeDashboardService.getDashboard(), []);
  const { data, isLoading, error } = useDetailData<IFinanceDashboardData>({
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

  const { deposits, volume_trend, recent_pending } = data;

  const trendData = volume_trend.map((item) => ({
    name: new Date(item.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    }),
    value: item.amount,
    color: CHART_SETS.verification[0],
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Welcome back, {profile.name}
        </h1>
        <p className="text-neutral-500 mt-1">Finance Dashboard Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Deposits"
          value={deposits.pending}
          icon={Clock}
        />
        <StatCard
          title="Approved Today"
          value={deposits.approved_today}
          icon={CheckCircle}
        />
        <StatCard
          title="Volume This Month"
          value={`Rp ${(deposits.volume_this_month / 1000000).toFixed(1)}M`}
          icon={Wallet}
        />
        <StatCard
          title="Rejected Today"
          value={deposits.rejected_today}
          icon={XCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Deposit Volume Trend (30 Days)">
          <BarChartComponent data={trendData} />
        </ChartCard>

        <FormCard>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">
              Recent Pending Deposits
            </h3>
            <div className="space-y-3">
              {recent_pending.length === 0 && (
                <p className="text-sm text-neutral-500">No pending deposits</p>
              )}
              {recent_pending.map((deposit) => (
                <div
                  key={deposit.id}
                  className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {deposit.user_name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Rp {deposit.amount.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(deposit.created_at).toLocaleDateString()}
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
