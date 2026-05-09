"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { Edit, UserPlus, X } from "lucide-react";
import { Badge } from "@app/components/ui/Table";
import { Button } from "@app/components/ui/Button";
import { FormInput } from "@app/components/ui/FormInput";
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
import { vouchersService } from "@services/marketing/vouchers";
import type {
  IVoucher,
  IVoucherUser,
} from "@services/marketing/vouchers/vouchers.types";

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

function getStatusBadge(voucher: IVoucher): {
  label: string;
  variant: "success" | "neutral" | "error" | "warning";
} {
  const now = new Date();
  if (!voucher.is_active) return { label: "Inactive", variant: "neutral" };
  if (new Date(voucher.expires_at) < now)
    return { label: "Expired", variant: "error" };
  if (new Date(voucher.starts_at) > now)
    return { label: "Scheduled", variant: "warning" };
  return { label: "Active", variant: "success" };
}

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  percentage: "Percentage",
  fixed_amount: "Fixed Amount",
  free_service: "Free Service",
  commission_discount: "Commission Discount",
};

const TARGET_USER_LABELS: Record<string, string> = {
  client: "Client",
  mitra: "Mitra",
  all: "All",
};

const DISTRIBUTION_LABELS: Record<string, string> = {
  public_code: "Public Code",
  auto_assign: "Auto Assign",
  both: "Both",
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function VoucherDetailPage() {
  const params = useParams();
  const voucherId = params.id as string;

  const fetcher = useCallback(
    () => vouchersService.detail(Number(voucherId)),
    [voucherId]
  );

  const {
    data: voucher,
    isLoading,
    error,
    refetch,
  } = useDetailData<IVoucher>({
    fetcher,
    enabled: !!voucherId,
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

  if (error || !voucher) {
    return (
      <div className="w-full">
        <FormCard>
          <FormCardError
            message={error || "Voucher tidak ditemukan."}
            title="Gagal memuat data"
            backHref={PATHS.vouchers}
            backLabel="Kembali ke Vouchers"
          />
        </FormCard>
      </div>
    );
  }

  const status = getStatusBadge(voucher);
  const quotaDisplay = voucher.quota
    ? `${voucher.used_count} / ${voucher.quota}`
    : `${voucher.used_count} / Unlimited`;
  const redemptionRate =
    voucher.quota && voucher.quota > 0
      ? ((voucher.used_count / voucher.quota) * 100).toFixed(1)
      : null;

  return (
    <div className="w-full space-y-6">
      <DetailCard>
        <DetailCardHeader
          title={voucher.name}
          description={
            voucher.code ? `Code: ${voucher.code}` : "No public code"
          }
          badge={status.label}
          badgeVariant={status.variant}
          actions={
            <Button
              variant="outlined"
              size="sm"
              href={PATHS.voucherEdit(voucher.id)}
              className="gap-1.5"
            >
              <Edit size={14} />
              Edit
            </Button>
          }
        />

        <DetailCardBody>
          {/* Usage Stats */}
          <DetailSection title="Usage Statistics">
            <DetailFieldGrid columns={3}>
              <DetailField label="Used / Quota" value={quotaDisplay} />
              <DetailField
                label="Redemption Rate"
                value={
                  redemptionRate ? `${redemptionRate}%` : "N/A (Unlimited)"
                }
              />
              <DetailField
                label="Per User Limit"
                value={String(voucher.per_user_limit)}
              />
            </DetailFieldGrid>
          </DetailSection>

          {/* Voucher Configuration */}
          <DetailSection title="Voucher Configuration">
            <DetailFieldGrid columns={3}>
              <DetailField
                label="Discount Type"
                value={
                  <Badge variant="primary" showDot={false}>
                    {DISCOUNT_TYPE_LABELS[voucher.discount_type] ||
                      voucher.discount_type}
                  </Badge>
                }
              />
              <DetailField
                label="Target User"
                value={
                  <Badge variant="tertiary" showDot={false}>
                    {TARGET_USER_LABELS[voucher.target_user_type] ||
                      voucher.target_user_type}
                  </Badge>
                }
              />
              <DetailField
                label="Distribution"
                value={
                  DISTRIBUTION_LABELS[voucher.distribution_type] ||
                  voucher.distribution_type
                }
              />
              <DetailField
                label="Discount Value"
                value={
                  voucher.discount_type === "percentage" ||
                  voucher.discount_type === "commission_discount"
                    ? `${voucher.discount_value}%`
                    : voucher.discount_type === "fixed_amount"
                      ? formatCurrency(voucher.discount_value)
                      : "—"
                }
              />
              {voucher.max_discount_cap && (
                <DetailField
                  label="Max Discount Cap"
                  value={formatCurrency(voucher.max_discount_cap)}
                />
              )}
              {voucher.min_transaction_amount && (
                <DetailField
                  label="Min Transaction"
                  value={formatCurrency(voucher.min_transaction_amount)}
                />
              )}
            </DetailFieldGrid>
          </DetailSection>

          {/* Period */}
          <DetailSection title="Validity Period">
            <DetailFieldGrid columns={3}>
              <DetailField
                label="Starts At"
                value={formatShortDate(voucher.starts_at)}
              />
              <DetailField
                label="Expires At"
                value={formatShortDate(voucher.expires_at)}
              />
              <DetailField
                label="Status"
                value={<Badge variant={status.variant}>{status.label}</Badge>}
              />
            </DetailFieldGrid>
          </DetailSection>

          {/* Metadata */}
          <DetailSection title="Metadata">
            <DetailFieldGrid columns={3}>
              <DetailField
                label="Created At"
                value={formatDate(voucher.created_at)}
              />
              <DetailField
                label="Updated At"
                value={formatDate(voucher.updated_at)}
              />
              <DetailField label="Voucher ID" value={String(voucher.id)} />
            </DetailFieldGrid>
          </DetailSection>

          {/* Assigned Users */}
          <DetailSection title="Assigned Users">
            <AssignedUsersSection
              voucherId={voucher.id}
              users={voucher.users || []}
              onAssigned={refetch}
            />
          </DetailSection>
        </DetailCardBody>
      </DetailCard>
    </div>
  );
}

// ─── Assigned Users Section ─────────────────────────────────────────────────────

interface AssignedUsersSectionProps {
  voucherId: number;
  users: IVoucherUser[];
  onAssigned: () => void;
}

function AssignedUsersSection({
  voucherId,
  users,
  onAssigned,
}: AssignedUsersSectionProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          {users.length > 0
            ? `${users.length} user(s) assigned`
            : "No users assigned yet"}
        </p>
        <Button
          variant="outlined"
          size="sm"
          onClick={() => setShowModal(true)}
          className="gap-1.5"
        >
          <UserPlus size={14} />
          Assign to User
        </Button>
      </div>

      {users.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-border-subtle">
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                  User Name
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                  Assigned At
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                  Usage Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50/50">
                  <td className="px-4 py-3 font-medium text-text-main">
                    {user.user?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {user.assigned_at ? formatShortDate(user.assigned_at) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {user.used_at ? (
                      <Badge variant="success">Used</Badge>
                    ) : (
                      <Badge variant="neutral">Unused</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {user.usage_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AssignModal
          voucherId={voucherId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            onAssigned();
          }}
        />
      )}
    </div>
  );
}

// ─── Assign Modal ───────────────────────────────────────────────────────────────

interface AssignModalProps {
  voucherId: number;
  onClose: () => void;
  onSuccess: () => void;
}

function AssignModal({ voucherId, onClose, onSuccess }: AssignModalProps) {
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [userIdsInput, setUserIdsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputError, setInputError] = useState("");

  const handleSubmit = async () => {
    setInputError("");

    const trimmed = userIdsInput.trim();
    if (!trimmed) {
      setInputError("User IDs wajib diisi.");
      return;
    }

    const userIds = trimmed
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => !isNaN(id) && id > 0);

    if (userIds.length === 0) {
      setInputError("Masukkan minimal 1 user ID yang valid.");
      return;
    }

    setIsSubmitting(true);
    try {
      await vouchersService.assign(voucherId, { user_ids: userIds });
      showNotification("Voucher berhasil di-assign ke user.", "success");
      onSuccess();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      showNotification(apiError.message || "Gagal assign voucher.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-bg-card rounded-2xl shadow-xl border border-border-subtle w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-main">Assign to User</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X size={16} />
          </Button>
        </div>

        <div className="space-y-4">
          <FormInput
            id="user_ids_input"
            label="User IDs"
            placeholder="Comma-separated IDs, e.g. 1, 2, 3"
            value={userIdsInput}
            onChange={(e) => {
              setUserIdsInput(e.target.value);
              if (inputError) setInputError("");
            }}
            error={inputError}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              <UserPlus size={14} className="mr-1.5" />
              Assign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
