"use client";

import React, { useCallback } from "react";
import { useUserProfile } from "@store/useUserProfile";
import { Megaphone, Ticket, Users, Newspaper, Layers } from "lucide-react";
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
  marketingDashboardService,
  IMarketingDashboardData,
} from "@services/marketing/dashboard";

export default function MarketingDashboardPage() {
  const { profile, isLoading: isProfileLoading } = useUserProfile();

  const fetcher = useCallback(
    () => marketingDashboardService.getDashboard(),
    []
  );
  const { data, isLoading, error } = useDetailData<IMarketingDashboardData>({
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
    campaigns,
    vouchers,
    articles,
    popups,
    funnel_summary,
    top_referrers,
  } = data;

  const funnelData = [
    {
      name: "Registered",
      value: funnel_summary.registered,
      color: CHART_SETS.mitraStatus[0],
    },
    {
      name: "Verified",
      value: funnel_summary.verified,
      color: CHART_SETS.mitraStatus[1],
    },
    {
      name: "Funded",
      value: funnel_summary.funded,
      color: CHART_SETS.verification[0],
    },
    {
      name: "Active",
      value: funnel_summary.active,
      color: CHART_SETS.verification[1],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Welcome back, {profile.name}
        </h1>
        <p className="text-neutral-500 mt-1">Marketing Dashboard Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Active Campaigns"
          value={campaigns.active}
          icon={Megaphone}
          description={`${campaigns.total_referrals} referrals`}
        />
        <StatCard
          title="Vouchers Redeemed"
          value={vouchers.redeemed_this_month}
          icon={Ticket}
          description={`${vouchers.active} active`}
        />
        <StatCard
          title="Total Referrals"
          value={campaigns.total_referrals}
          icon={Users}
        />
        <StatCard
          title="Published Articles"
          value={articles.published}
          icon={Newspaper}
          description={`${articles.draft} drafts`}
        />
        <StatCard
          title="Active Popups"
          value={popups?.active_count ?? 0}
          icon={Layers}
          description={`${popups?.total_impressions ?? 0} impressions`}
        />
        <StatCard
          title="Popup Conversions"
          value={popups?.conversions_this_month ?? 0}
          icon={Layers}
          description="This month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Funnel Conversion Overview">
          <BarChartComponent data={funnelData} />
        </ChartCard>

        <FormCard>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">
              Top Referrers
            </h3>
            <div className="space-y-3">
              {top_referrers.length === 0 && (
                <p className="text-sm text-neutral-500">No referrers yet</p>
              )}
              {top_referrers.map((referrer, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium text-neutral-800">
                      {referrer.name}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-700">
                    {referrer.referral_count}
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
