"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CheckCircle, XCircle, Download } from "lucide-react";
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
import { FormInput } from "@app/components/ui/FormInput";
import { FormSelect } from "@app/components/ui/FormSelect";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { useNotificationStore } from "@store/useNotificationStore";
import {
  depositRequestsService,
  type IDepositRequest,
  type IUpdateDepositStatusPayload,
} from "@services/backoffice/deposit-requests";

// ─── Badge Configs ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  string,
  { variant: "warning" | "success" | "error" | "neutral"; label: string }
> = {
  pending: { variant: "warning", label: "Pending" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "error", label: "Rejected" },
  expired: { variant: "neutral", label: "Expired" },
};

// ─── Status Options ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Format amount as Indonesian Rupiah */
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Check if a URL points to an image based on extension */
function isImageUrl(url: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some((ext) => lowerUrl.includes(ext));
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function DepositRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const fetcher = useCallback(() => depositRequestsService.detail(id), [id]);

  const {
    data: deposit,
    isLoading,
    error,
    refetch,
  } = useDetailData<IDepositRequest>({
    fetcher,
    enabled: !!id,
  });

  // Status update form state
  const [form, setForm] = useState<IUpdateDepositStatusPayload>({
    status: "approved",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitStatus = async () => {
    if (form.status === "rejected" && !form.reason?.trim()) {
      showNotification("Alasan wajib diisi untuk penolakan.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: IUpdateDepositStatusPayload = {
        status: form.status,
      };
      if (form.reason?.trim()) {
        payload.reason = form.reason.trim();
      }

      await depositRequestsService.updateStatus(id, payload);
      showNotification(
        "Status deposit request berhasil diperbarui.",
        "success"
      );
      refetch();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      showNotification(
        apiError.message || "Gagal memperbarui status.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <FormCard>
          <FormCardLoading />
        </FormCard>
      </div>
    );
  }

  if (error || !deposit) {
    return (
      <div className="w-full">
        <FormCard>
          <FormCardError
            message={error || "Deposit request tidak ditemukan."}
            title="Gagal memuat data"
            backHref="/dashboard/deposit-requests"
            backLabel="Kembali"
          />
        </FormCard>
      </div>
    );
  }

  const isPending = deposit.status === "pending";
  const statusCfg = STATUS_BADGE[deposit.status] ?? {
    variant: "neutral" as const,
    label: deposit.status,
  };

  return (
    <div className="w-full space-y-6">
      <DetailCard>
        <DetailCardHeader
          title={deposit.reference_code}
          description={`by ${deposit.user?.name ?? "Unknown"}`}
          badge={statusCfg.label}
          badgeVariant={statusCfg.variant}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/deposit-requests")}
              className="gap-1.5"
            >
              <ArrowLeft size={14} />
              Kembali
            </Button>
          }
        />

        <DetailCardBody>
          {/* Deposit Info */}
          <DetailSection title="Informasi Deposit">
            <DetailFieldGrid columns={3}>
              <DetailField label="Nama Client" value={deposit.user?.name} />
              <DetailField label="Email" value={deposit.user?.email} />
              <DetailField
                label="Reference Code"
                value={deposit.reference_code}
              />
              <DetailField
                label="Jumlah"
                value={formatRupiah(deposit.amount)}
              />
              <DetailField
                label="Metode Pembayaran"
                value={deposit.payment_method}
              />
              <DetailField
                label="Status"
                value={
                  <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                }
              />
              <DetailField
                label="Tanggal Dibuat"
                value={new Date(deposit.created_at).toLocaleDateString(
                  "id-ID",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              />
            </DetailFieldGrid>
          </DetailSection>

          {/* Attachment */}
          {deposit.attachment_url && (
            <DetailSection title="Lampiran">
              {isImageUrl(deposit.attachment_url) ? (
                <Button
                  variant="ghost"
                  className="p-0 border-none hover:border-none h-auto"
                  onClick={() => window.open(deposit.attachment_url!, "_blank")}
                >
                  <Image
                    src={deposit.attachment_url}
                    alt={`Lampiran ${deposit.reference_code}`}
                    width={300}
                    height={200}
                    className="rounded-lg object-cover"
                    unoptimized
                  />
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(deposit.attachment_url!, "_blank")}
                  className="gap-2"
                >
                  <Download size={14} />
                  Download Lampiran
                </Button>
              )}
            </DetailSection>
          )}

          {/* Status Update (pending only) */}
          {isPending ? (
            <DetailSection title="Update Status">
              <div className="space-y-4 max-w-lg">
                <FormSelect
                  label="Status"
                  id="status"
                  value={form.status}
                  options={STATUS_OPTIONS}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as "approved" | "rejected",
                    }))
                  }
                />
                <FormInput
                  as="textarea"
                  label={
                    form.status === "rejected"
                      ? "Alasan (wajib)"
                      : "Alasan (opsional)"
                  }
                  id="reason"
                  placeholder="Berikan alasan perubahan status..."
                  value={form.reason ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, reason: e.target.value }))
                  }
                />
                <Button
                  variant="primary"
                  onClick={handleSubmitStatus}
                  disabled={
                    isSubmitting ||
                    (form.status === "rejected" && !form.reason?.trim())
                  }
                  className="gap-2"
                >
                  {form.status === "approved" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  {isSubmitting
                    ? "Memproses..."
                    : form.status === "approved"
                      ? "Approve"
                      : "Reject"}
                </Button>
              </div>
            </DetailSection>
          ) : (
            /* Review Info (non-pending) */
            <DetailSection title="Informasi Review">
              <DetailFieldGrid columns={3}>
                <DetailField
                  label="Status"
                  value={
                    <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                  }
                />
                <DetailField
                  label="Reviewer"
                  value={deposit.reviewer?.name ?? "—"}
                />
                <DetailField
                  label="Tanggal Review"
                  value={
                    deposit.reviewed_at
                      ? new Date(deposit.reviewed_at).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "—"
                  }
                />
              </DetailFieldGrid>
              {deposit.review_reason && (
                <div className="mt-4">
                  <DetailField label="Alasan" value={deposit.review_reason} />
                </div>
              )}
            </DetailSection>
          )}
        </DetailCardBody>
      </DetailCard>
    </div>
  );
}
