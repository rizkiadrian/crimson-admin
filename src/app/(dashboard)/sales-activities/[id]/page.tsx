"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
import { CommentThread } from "@app/components/ui/CommentThread";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { useUserProfile } from "@store/useUserProfile";
import {
  activityLogsService,
  IActivityLog,
} from "@services/sales/activity-logs";

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

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function SalesActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const activityLogId = Number(params.id);
  const { profile } = useUserProfile();

  const fetcher = useCallback(
    () => activityLogsService.getActivityLogDetail(activityLogId),
    [activityLogId]
  );

  const {
    data: activityLog,
    isLoading,
    error,
  } = useDetailData<IActivityLog>({
    fetcher,
    enabled: !!activityLogId,
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

  if (error || !activityLog) {
    return (
      <div className="w-full">
        <FormCard>
          <FormCardError
            message={error || "Activity log tidak ditemukan."}
            title="Gagal memuat data"
            backHref="/sales-activities"
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

  // Sales user has comment access if they own the log and it's been reviewed
  const hasCommentAccess =
    !isPending && activityLog.user_id === (profile?.id ?? 0);

  return (
    <div className="w-full space-y-6">
      <DetailCard>
        <DetailCardHeader
          title={activityLog.title}
          badge={statusCfg.label}
          badgeVariant={statusCfg.variant}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/sales-activities")}
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

          {/* Review Info (only when reviewed) */}
          {!isPending && (
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
                hasAccess={hasCommentAccess}
              />
            </DetailSection>
          )}
        </DetailCardBody>
      </DetailCard>
    </div>
  );
}
