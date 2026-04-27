"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
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
import { CommentThread } from "@app/components/ui/CommentThread";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { useNotificationStore } from "@store/useNotificationStore";
import { useUserProfile } from "@store/useUserProfile";
import {
  backofficeActivityLogsService,
  IBackofficeActivityLog,
  IUpdateStatusPayload,
} from "@services/backoffice/activity-logs";

// ─── Badge Configs ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  string,
  { variant: "warning" | "success" | "error"; label: string }
> = {
  pending: { variant: "warning", label: "Pending" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "error", label: "Rejected" },
};

const TYPE_BADGE: Record<
  string,
  { variant: "primary" | "tertiary" | "neutral"; label: string }
> = {
  general_note: { variant: "neutral", label: "General Note" },
  request_lead_assign: { variant: "primary", label: "Request Lead Assign" },
  request_update_lead_status: {
    variant: "tertiary",
    label: "Update Lead Status",
  },
};

// ─── Lead Status Labels ─────────────────────────────────────────────────────────

const LEAD_STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

const LEAD_STATUS_BADGE: Record<
  string,
  "warning" | "success" | "error" | "primary" | "tertiary" | "neutral"
> = {
  new: "neutral",
  contacted: "primary",
  qualified: "tertiary",
  proposal: "warning",
  negotiation: "warning",
  won: "success",
  lost: "error",
};

// ─── Status Options ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function BackofficeActivityLogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const activityLogId = Number(params.id);
  const showNotification = useNotificationStore((s) => s.showNotification);
  const { profile } = useUserProfile();

  const fetcher = useCallback(
    () => backofficeActivityLogsService.detail(activityLogId),
    [activityLogId]
  );

  const {
    data: activityLog,
    isLoading,
    error,
    refetch,
  } = useDetailData<IBackofficeActivityLog>({
    fetcher,
    enabled: !!activityLogId,
  });

  // Status update form state
  const [form, setForm] = useState<IUpdateStatusPayload>({
    status: "approved",
    reason: "",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitStatus = async () => {
    if (!form.reason.trim()) {
      showNotification("Alasan wajib diisi.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: IUpdateStatusPayload = {
        status: form.status,
        reason: form.reason.trim(),
      };
      if (form.comment?.trim()) {
        payload.comment = form.comment.trim();
      }

      await backofficeActivityLogsService.updateStatus(activityLogId, payload);
      showNotification("Status berhasil diperbarui.", "success");
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

  if (error || !activityLog) {
    return (
      <div className="w-full">
        <FormCard>
          <FormCardError
            message={error || "Activity log tidak ditemukan."}
            title="Gagal memuat data"
            backHref="/dashboard/activity-logs"
            backLabel="Kembali"
          />
        </FormCard>
      </div>
    );
  }

  const isPending = activityLog.status === "pending";
  const statusCfg = STATUS_BADGE[activityLog.status] ?? {
    variant: "neutral" as const,
    label: activityLog.status,
  };
  const typeCfg = TYPE_BADGE[activityLog.type] ?? {
    variant: "neutral" as const,
    label: activityLog.type,
  };

  return (
    <div className="w-full space-y-6">
      <DetailCard>
        <DetailCardHeader
          title={activityLog.title}
          description={`by ${activityLog.user?.name ?? "Unknown"}`}
          badge={statusCfg.label}
          badgeVariant={statusCfg.variant}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/activity-logs")}
              className="gap-1.5"
            >
              <ArrowLeft size={14} />
              Kembali
            </Button>
          }
        />

        <DetailCardBody>
          {/* Activity Info */}
          <DetailSection title="Informasi Activity">
            <DetailFieldGrid columns={3}>
              <DetailField label="Sales" value={activityLog.user?.name} />
              <DetailField
                label="Type"
                value={<Badge variant={typeCfg.variant}>{typeCfg.label}</Badge>}
              />
              <DetailField
                label="Status"
                value={
                  <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                }
              />
              <DetailField label="Lead" value={activityLog.lead?.name ?? "—"} />
              <DetailField
                label="Dibuat"
                value={new Date(activityLog.created_at).toLocaleDateString(
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
            {activityLog.description && (
              <div className="mt-4">
                <DetailField
                  label="Deskripsi"
                  value={activityLog.description}
                />
              </div>
            )}
          </DetailSection>

          {/* Request Details (metadata) */}
          {activityLog.type === "request_update_lead_status" &&
          activityLog.metadata?.requested_status ? (
            <DetailSection title="Detail Permintaan">
              <DetailFieldGrid columns={3}>
                <DetailField
                  label="Tipe Lead"
                  value={
                    activityLog.lead?.type ? (
                      <Badge
                        variant={
                          activityLog.lead.type === "client"
                            ? "primary"
                            : "tertiary"
                        }
                      >
                        {activityLog.lead.type === "client"
                          ? "Client"
                          : "Mitra"}
                      </Badge>
                    ) : (
                      "—"
                    )
                  }
                />
                <DetailField
                  label="Status Lead Saat Ini"
                  value={
                    activityLog.lead?.status ? (
                      <Badge
                        variant={
                          LEAD_STATUS_BADGE[activityLog.lead.status] ??
                          "neutral"
                        }
                      >
                        {LEAD_STATUS_LABEL[activityLog.lead.status] ??
                          activityLog.lead.status}
                      </Badge>
                    ) : (
                      "—"
                    )
                  }
                />
                <DetailField
                  label="Status Yang Diminta"
                  value={
                    <Badge
                      variant={
                        LEAD_STATUS_BADGE[
                          String(activityLog.metadata.requested_status)
                        ] ?? "neutral"
                      }
                    >
                      {LEAD_STATUS_LABEL[
                        String(activityLog.metadata.requested_status)
                      ] ?? String(activityLog.metadata.requested_status)}
                    </Badge>
                  }
                />
              </DetailFieldGrid>
            </DetailSection>
          ) : null}

          {activityLog.type === "request_lead_assign" ? (
            <DetailSection title="Detail Permintaan">
              <DetailFieldGrid columns={3}>
                <DetailField
                  label="Lead"
                  value={activityLog.lead?.name ?? "—"}
                />
                <DetailField
                  label="Tipe Lead"
                  value={
                    activityLog.lead?.type ? (
                      <Badge
                        variant={
                          activityLog.lead.type === "client"
                            ? "primary"
                            : "tertiary"
                        }
                      >
                        {activityLog.lead.type === "client"
                          ? "Client"
                          : "Mitra"}
                      </Badge>
                    ) : (
                      "—"
                    )
                  }
                />
                <DetailField
                  label="Sales ID Yang Diminta"
                  value={
                    activityLog.metadata?.requested_sales_id ? (
                      <Badge variant="primary">
                        {String(activityLog.metadata.requested_sales_id)}
                      </Badge>
                    ) : (
                      "—"
                    )
                  }
                />
              </DetailFieldGrid>
            </DetailSection>
          ) : null}

          {/* Attachment */}
          {activityLog.attachment_url && (
            <DetailSection title="Lampiran">
              {activityLog.attachment_type === "image" &&
              activityLog.thumbnail_url ? (
                <a
                  href={activityLog.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activityLog.thumbnail_url}
                    alt={activityLog.title}
                    className="max-w-[200px] h-auto rounded-lg"
                  />
                </a>
              ) : (
                <a
                  href={activityLog.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline"
                >
                  Download Attachment
                </a>
              )}
            </DetailSection>
          )}

          {/* Status Update / Review Info */}
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
                  label="Alasan (wajib)"
                  id="reason"
                  placeholder="Berikan alasan perubahan status..."
                  value={form.reason}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, reason: e.target.value }))
                  }
                />
                <FormInput
                  as="textarea"
                  label="Komentar Awal (opsional)"
                  id="comment"
                  placeholder="Tambahkan komentar untuk sales..."
                  value={form.comment ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, comment: e.target.value }))
                  }
                />
                <Button
                  variant="primary"
                  onClick={handleSubmitStatus}
                  disabled={isSubmitting || !form.reason.trim()}
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
                  value={activityLog.status_changed_by_user?.name ?? "—"}
                />
                <DetailField
                  label="Tanggal Review"
                  value={
                    activityLog.status_changed_at
                      ? new Date(
                          activityLog.status_changed_at
                        ).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"
                  }
                />
              </DetailFieldGrid>
              {activityLog.status_change_reason && (
                <div className="mt-4">
                  <DetailField
                    label="Alasan"
                    value={activityLog.status_change_reason}
                  />
                </div>
              )}
            </DetailSection>
          )}

          {/* Comment Thread (only when reviewed) */}
          {!isPending && (
            <DetailSection title="">
              <CommentThread
                activityLogId={activityLog.id}
                currentUserId={profile?.id ?? 0}
                hasAccess={true}
              />
            </DetailSection>
          )}
        </DetailCardBody>
      </DetailCard>
    </div>
  );
}
