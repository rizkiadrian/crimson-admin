"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Circle, AlertTriangle, RotateCcw } from "lucide-react";
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
import { useNotificationStore } from "@store/useNotificationStore";
import { PATHS } from "@config/routing";
import { referralsService } from "@services/marketing/referrals";
import type {
  IReferralDetail,
  IReferralReward,
  ReferralStatus,
  RewardStatus,
  RecipientType,
  RewardType,
} from "@services/marketing/referrals";

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
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
  ReferralStatus,
  { variant: "warning" | "success" | "neutral" | "error"; label: string }
> = {
  pending: { variant: "warning", label: "Pending" },
  completed: { variant: "success", label: "Completed" },
  expired: { variant: "neutral", label: "Expired" },
  flagged: { variant: "error", label: "Flagged" },
};

const REWARD_STATUS_BADGE: Record<
  RewardStatus,
  { variant: "warning" | "success" | "error"; label: string }
> = {
  pending: { variant: "warning", label: "Pending" },
  disbursed: { variant: "success", label: "Disbursed" },
  failed: { variant: "error", label: "Failed" },
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function ReferralDetailPage() {
  const params = useParams();
  const referralId = params.id as string;

  const fetcher = useCallback(
    () => referralsService.detail(Number(referralId)),
    [referralId]
  );

  const {
    data: referral,
    isLoading,
    error,
    refetch,
  } = useDetailData<IReferralDetail>({
    fetcher,
    enabled: !!referralId,
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

  if (error || !referral) {
    return (
      <div className="w-full">
        <FormCard>
          <FormCardError
            message={error || "Referral tidak ditemukan."}
            title="Gagal memuat data"
            backHref={PATHS.referrals}
            backLabel="Kembali ke Referrals"
          />
        </FormCard>
      </div>
    );
  }

  return <ReferralDetailContent referral={referral} onRefetch={refetch} />;
}

// ─── Detail Content ─────────────────────────────────────────────────────────────

function ReferralDetailContent({
  referral,
  onRefetch,
}: {
  referral: IReferralDetail;
  onRefetch: () => void;
}) {
  const statusCfg = STATUS_BADGE[referral.status];

  return (
    <div className="w-full space-y-6">
      {/* Referrer & Referee Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailCard>
          <DetailCardBody>
            <DetailSection title="Referrer">
              <DetailFieldGrid columns={2}>
                <DetailField
                  label="Name"
                  value={referral.referrer?.name || "—"}
                />
                <DetailField
                  label="Email"
                  value={referral.referrer?.email || "—"}
                />
              </DetailFieldGrid>
            </DetailSection>
          </DetailCardBody>
        </DetailCard>

        <DetailCard>
          <DetailCardBody>
            <DetailSection title="Referee">
              <DetailFieldGrid columns={2}>
                <DetailField
                  label="Name"
                  value={referral.referee?.name || "—"}
                />
                <DetailField
                  label="Email"
                  value={referral.referee?.email || "—"}
                />
              </DetailFieldGrid>
            </DetailSection>
          </DetailCardBody>
        </DetailCard>
      </div>

      {/* Referral Info */}
      <DetailCard>
        <DetailCardHeader
          title="Referral Details"
          badge={statusCfg.label}
          badgeVariant={statusCfg.variant}
        />
        <DetailCardBody>
          <DetailSection title="Information">
            <DetailFieldGrid columns={3}>
              <DetailField
                label="Campaign"
                value={referral.campaign?.name || "—"}
              />
              <DetailField
                label="Referral Code"
                value={referral.referral_code}
              />
              <DetailField
                label="Status"
                value={
                  <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                }
              />
              <DetailField
                label="Created At"
                value={formatDate(referral.created_at)}
              />
              <DetailField
                label="Completed At"
                value={
                  referral.completed_at
                    ? formatDate(referral.completed_at)
                    : "—"
                }
              />
              <DetailField
                label="Expires At"
                value={
                  referral.expires_at ? formatDate(referral.expires_at) : "—"
                }
              />
            </DetailFieldGrid>
          </DetailSection>

          {/* Flag Section */}
          {referral.status === "flagged" && referral.flag_reason && (
            <DetailSection title="Flag Information">
              <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={16}
                    className="text-error-600 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-error-800">
                      Flagged
                    </p>
                    <p className="text-sm text-error-700 mt-1">
                      {referral.flag_reason}
                    </p>
                  </div>
                </div>
              </div>
            </DetailSection>
          )}
        </DetailCardBody>
      </DetailCard>

      {/* Milestone Timeline */}
      {referral.campaign?.milestones &&
        referral.campaign.milestones.length > 0 && (
          <DetailCard>
            <DetailCardBody>
              <DetailSection title="Milestone Progress">
                <MilestoneTimeline
                  milestones={referral.campaign.milestones}
                  currentMilestoneId={referral.current_milestone_id}
                />
              </DetailSection>
            </DetailCardBody>
          </DetailCard>
        )}

      {/* Reward History */}
      {referral.rewards && referral.rewards.length > 0 && (
        <DetailCard>
          <DetailCardBody>
            <DetailSection title="Reward History">
              <RewardTable rewards={referral.rewards} onRetry={onRefetch} />
            </DetailSection>
          </DetailCardBody>
        </DetailCard>
      )}
    </div>
  );
}

// ─── Milestone Timeline ─────────────────────────────────────────────────────────

function MilestoneTimeline({
  milestones,
  currentMilestoneId,
}: {
  milestones: {
    id: number;
    name: string;
    sort_order: number;
    event_type: string;
  }[];
  currentMilestoneId: number | null;
}) {
  const sorted = [...milestones].sort((a, b) => a.sort_order - b.sort_order);
  const currentIndex = currentMilestoneId
    ? sorted.findIndex((m) => m.id === currentMilestoneId)
    : -1;

  return (
    <div className="space-y-3">
      {sorted.map((milestone, index) => {
        const isCompleted = currentIndex >= 0 && index <= currentIndex;
        const isCurrent = milestone.id === currentMilestoneId;

        return (
          <div
            key={milestone.id}
            className={`flex items-center gap-4 rounded-xl border p-4 ${
              isCurrent
                ? "border-primary-300 bg-primary-50"
                : isCompleted
                  ? "border-success-200 bg-success-50"
                  : "border-border-subtle"
            }`}
          >
            <div className="shrink-0">
              {isCompleted ? (
                <CheckCircle2 size={20} className="text-success-600" />
              ) : (
                <Circle size={20} className="text-neutral-300" />
              )}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-semibold ${
                  isCompleted ? "text-success-700" : "text-text-main"
                }`}
              >
                {milestone.name}
              </p>
              <p className="text-xs text-text-muted">
                Event: {milestone.event_type}
              </p>
            </div>
            <div className="text-xs text-text-muted">
              Step {milestone.sort_order}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Reward Table ───────────────────────────────────────────────────────────────

function RewardTable({
  rewards,
  onRetry,
}: {
  rewards: IReferralReward[];
  onRetry: () => void;
}) {
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleRetry = async (rewardId: string) => {
    try {
      const resp = await referralsService.retryReward(rewardId);
      showNotification(resp.message || "Retry berhasil", "success");
      onRetry();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      showNotification(apiError.message || "Gagal retry reward", "error");
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 border-b border-border-subtle">
            <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
              Milestone
            </th>
            <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
              Recipient
            </th>
            <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
              Type
            </th>
            <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
              Amount
            </th>
            <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
              Status
            </th>
            <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
              Disbursed At
            </th>
            <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {rewards.map((reward) => {
            const statusCfg = REWARD_STATUS_BADGE[reward.status];
            return (
              <tr key={reward.id} className="hover:bg-neutral-50/50">
                <td className="px-4 py-3 text-text-main">
                  {reward.milestone?.name || "—"}
                </td>
                <td className="px-4 py-3">
                  <RecipientBadge type={reward.recipient_type} />
                </td>
                <td className="px-4 py-3">
                  <RewardTypeBadge type={reward.reward_type} />
                </td>
                <td className="px-4 py-3 text-text-main">
                  {reward.amount
                    ? formatCurrency(reward.amount + reward.tier_bonus_amount)
                    : "—"}
                  {reward.tier_bonus_amount > 0 && (
                    <span className="text-xs text-success-600 ml-1">
                      (+{formatCurrency(reward.tier_bonus_amount)} bonus)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {reward.disbursed_at
                    ? formatShortDate(reward.disbursed_at)
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {reward.status === "failed" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
                      aria-label="Retry"
                      onClick={() => handleRetry(reward.id)}
                    >
                      <RotateCcw size={14} />
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Badge Helpers ──────────────────────────────────────────────────────────────

function RecipientBadge({ type }: { type: RecipientType }) {
  return (
    <Badge
      variant={type === "referrer" ? "primary" : "tertiary"}
      showDot={false}
    >
      {type === "referrer" ? "Referrer" : "Referee"}
    </Badge>
  );
}

function RewardTypeBadge({ type }: { type: RewardType }) {
  return (
    <Badge
      variant={type === "cashback" ? "success" : "warning"}
      showDot={false}
    >
      {type === "cashback" ? "Cashback" : "Voucher"}
    </Badge>
  );
}
