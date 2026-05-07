"use client";

import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Edit } from "lucide-react";
import { Badge } from "@app/components/ui/Table";
import { Button } from "@app/components/ui/Button";
import {
  DetailCard,
  DetailCardHeader,
  DetailCardBody,
  DetailSection,
  DetailField,
  DetailFieldGrid,
} from "@app/components/ui/DetailCard";
import {
  FormCard,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { PATHS } from "@config/routing";
import { referralCampaignsService } from "@services/backoffice/referral-campaigns";
import { referralAnalyticsService } from "@services/backoffice/referrals";
import type {
  IReferralCampaignDetail,
  ReferralCampaignStatus,
} from "@services/backoffice/referral-campaigns";
import type { IReferralOverview } from "@services/backoffice/referrals";

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const STATUS_BADGE: Record<
  ReferralCampaignStatus,
  { variant: "neutral" | "success" | "warning" | "error"; label: string }
> = {
  draft: { variant: "neutral", label: "Draft" },
  active: { variant: "success", label: "Active" },
  paused: { variant: "warning", label: "Paused" },
  ended: { variant: "error", label: "Ended" },
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function ReferralCampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const fetcher = useCallback(
    () => referralCampaignsService.detail(Number(campaignId)),
    [campaignId]
  );

  const {
    data: campaign,
    isLoading,
    error,
  } = useDetailData<IReferralCampaignDetail>({
    fetcher,
    enabled: !!campaignId,
  });

  if (isLoading) {
    return (
      <div className="w-full">
        <FormCard>
          <FormCardLoading />
        </FormCard>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="w-full">
        <FormCard>
          <FormCardError
            message={error || "Campaign tidak ditemukan."}
            title="Gagal memuat data"
            backHref={PATHS.referralCampaigns}
            backLabel="Kembali ke Campaigns"
          />
        </FormCard>
      </div>
    );
  }

  return <CampaignDetailContent campaign={campaign} />;
}

// ─── Detail Content ─────────────────────────────────────────────────────────────

function CampaignDetailContent({
  campaign,
}: {
  campaign: IReferralCampaignDetail;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "referrals" | "leaderboard"
  >("overview");
  const [overview, setOverview] = useState<IReferralOverview | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchOverview = async () => {
      try {
        const resp = await referralAnalyticsService.overview({
          campaign_id: campaign.id,
        });
        if (!cancelled) {
          setOverview(resp.data);
        }
      } catch {
        // Silently fail — overview is supplementary
      }
    };
    fetchOverview();
    return () => {
      cancelled = true;
    };
  }, [campaign.id]);

  const statusCfg = STATUS_BADGE[campaign.status];

  return (
    <div className="w-full space-y-6">
      {/* Campaign Info Card */}
      <DetailCard>
        <DetailCardHeader
          title={campaign.name}
          description={campaign.description || undefined}
          badge={statusCfg.label}
          badgeVariant={statusCfg.variant}
          actions={
            <Button
              variant="outlined"
              size="sm"
              href={PATHS.referralCampaignEdit(campaign.id)}
              className="gap-1.5"
            >
              <Edit size={14} />
              Edit
            </Button>
          }
        />

        <DetailCardBody>
          <DetailSection title="Campaign Configuration">
            <DetailFieldGrid columns={3}>
              <DetailField
                label="Target Role"
                value={
                  <Badge
                    variant={
                      campaign.target_role === "client" ? "primary" : "tertiary"
                    }
                    showDot={false}
                  >
                    {campaign.target_role === "client" ? "Client" : "Mitra"}
                  </Badge>
                }
              />
              <DetailField
                label="Status"
                value={
                  <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                }
              />
              <DetailField
                label="Period"
                value={`${formatDate(campaign.starts_at)}${campaign.ends_at ? ` – ${formatDate(campaign.ends_at)}` : " – No end"}`}
              />
              <DetailField
                label="Max Referrals Per User"
                value={
                  campaign.max_referrals_per_user
                    ? String(campaign.max_referrals_per_user)
                    : "Unlimited"
                }
              />
              <DetailField label="Campaign ID" value={String(campaign.id)} />
              <DetailField
                label="Created At"
                value={formatDate(campaign.created_at)}
              />
            </DetailFieldGrid>
          </DetailSection>
        </DetailCardBody>
      </DetailCard>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Referrals"
            value={String(overview.total_referrals)}
          />
          <StatCard
            label="Active Referrals"
            value={String(overview.active_referrals)}
          />
          <StatCard
            label="Completed"
            value={String(overview.completed_referrals)}
          />
          <StatCard
            label="Conversion Rate"
            value={`${overview.conversion_rate.toFixed(1)}%`}
          />
          <StatCard
            label="Total Disbursed"
            value={formatCurrency(overview.total_rewards_disbursed)}
          />
        </div>
      )}

      {/* Tabs */}
      <DetailCard>
        <div className="border-b border-border-subtle px-8">
          <div className="flex gap-6">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </TabButton>
            <TabButton
              active={activeTab === "referrals"}
              onClick={() => setActiveTab("referrals")}
            >
              Referrals
            </TabButton>
            <TabButton
              active={activeTab === "leaderboard"}
              onClick={() => setActiveTab("leaderboard")}
            >
              Leaderboard
            </TabButton>
          </div>
        </div>

        <div className="p-8">
          {activeTab === "overview" && <OverviewTab campaign={campaign} />}
          {activeTab === "referrals" && (
            <div className="text-sm text-text-muted">
              <Button
                variant="outlined"
                size="sm"
                href={`${PATHS.referrals}?campaign_id=${campaign.id}`}
              >
                View All Referrals for this Campaign
              </Button>
            </div>
          )}
          {activeTab === "leaderboard" && (
            <LeaderboardTab campaignId={campaign.id} />
          )}
        </div>
      </DetailCard>
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────────────────────

function OverviewTab({ campaign }: { campaign: IReferralCampaignDetail }) {
  return (
    <div className="space-y-8">
      {/* Milestones */}
      <div>
        <h4 className="text-sm font-semibold text-text-main mb-4">
          Milestones ({campaign.milestones.length})
        </h4>
        <div className="space-y-3">
          {campaign.milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center gap-4 rounded-xl border border-border-subtle p-4"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 text-sm font-bold">
                {milestone.sort_order}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-main">
                  {milestone.name}
                </p>
                <p className="text-xs text-text-muted">
                  Event: {milestone.event_type}
                </p>
              </div>
              <div className="text-right text-xs text-text-muted">
                <p>
                  Referrer:{" "}
                  {milestone.referrer_reward_type === "none"
                    ? "None"
                    : milestone.referrer_reward_type === "cashback"
                      ? formatCurrency(milestone.referrer_reward_amount || 0)
                      : "Voucher"}
                </p>
                <p>
                  Referee:{" "}
                  {milestone.referee_reward_type === "none"
                    ? "None"
                    : milestone.referee_reward_type === "cashback"
                      ? formatCurrency(milestone.referee_reward_amount || 0)
                      : "Voucher"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tiers */}
      {campaign.tiers.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-main mb-4">
            Tiers ({campaign.tiers.length})
          </h4>
          <div className="space-y-3">
            {campaign.tiers.map((tier) => (
              <div
                key={tier.id}
                className="flex items-center gap-4 rounded-xl border border-border-subtle p-4"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-tertiary-50 text-tertiary-600 text-sm font-bold">
                  {tier.sort_order}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-main">
                    {tier.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {tier.min_referrals}
                    {tier.max_referrals ? `–${tier.max_referrals}` : "+"}{" "}
                    referrals
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="success" showDot={false}>
                    +{tier.bonus_percentage}% bonus
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Leaderboard Tab ────────────────────────────────────────────────────────────

function LeaderboardTab({ campaignId }: { campaignId: number }) {
  const [leaderboard, setLeaderboard] = useState<
    {
      user_id: number;
      user: { id: number; name: string; email: string };
      completed_count: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchLeaderboard = async () => {
      try {
        const resp = await referralAnalyticsService.leaderboard({
          campaign_id: campaignId,
          limit: 10,
        });
        if (!cancelled) {
          setLeaderboard(resp.data);
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  if (loading) {
    return <p className="text-sm text-text-muted">Loading leaderboard...</p>;
  }

  if (leaderboard.length === 0) {
    return <p className="text-sm text-text-muted">No referral data yet.</p>;
  }

  return (
    <div className="space-y-3">
      {leaderboard.map((entry, index) => (
        <div
          key={entry.user_id}
          className="flex items-center gap-4 rounded-xl border border-border-subtle p-4"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 text-sm font-bold">
            #{index + 1}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-main">
              {entry.user.name}
            </p>
            <p className="text-xs text-text-muted">{entry.user.email}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-text-main">
              {entry.completed_count}
            </p>
            <p className="text-xs text-text-muted">completed</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-card rounded-2xl border border-border-subtle p-5">
      <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-lg font-bold text-text-main">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-4 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-primary-600 text-primary-600"
          : "border-transparent text-text-muted hover:text-text-main"
      }`}
    >
      {children}
    </button>
  );
}
