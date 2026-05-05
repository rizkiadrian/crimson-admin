"use client";

import React, { useCallback } from "react";
import { Button } from "@app/components/ui/Button";
import { Badge } from "@app/components/ui/Table";
import {
  DetailCard,
  DetailCardHeader,
  DetailCardBody,
  DetailSection,
  DetailField,
  DetailFieldGrid,
  DetailImageGrid,
} from "@app/components/ui/DetailCard";
import {
  FormCard,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";
import {
  mitraMembersService,
  IMitraUser,
} from "@services/backoffice/mitra-members";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { useParams, useSearchParams } from "next/navigation";
import { PATHS } from "@config/routing";
import { Pencil, ArrowLeft, ShieldCheck } from "lucide-react";
import { useConfirmStore } from "@store/useConfirmStore";
import { useNotificationStore } from "@store/useNotificationStore";

const STATUS_VARIANT: Record<
  string,
  "success" | "warning" | "error" | "neutral"
> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  suspended: "neutral",
};

export default function MitraMemberShowPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const memberId = Number(params.id);
  const returnPage = searchParams.get("returnPage");

  const backUrl = returnPage
    ? `${PATHS.mitraMembers}?page=${returnPage}`
    : PATHS.mitraMembers;

  const fetcher = useCallback(
    () => mitraMembersService.mitraMembersDetail(memberId),
    [memberId]
  );

  const {
    data: member,
    isLoading,
    error,
    refetch,
  } = useDetailData<IMitraUser>({
    fetcher,
    enabled: !!memberId,
  });

  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleVerify = () => {
    showConfirm({
      title: "Approve Mitra Verification?",
      description:
        "Mitra ini akan diverifikasi dan statusnya akan berubah menjadi approved. Mereka akan mendapatkan akses penuh ke platform.",
      confirmLabel: "Approve",
      cancelLabel: "Batal",
      onConfirm: async () => {
        try {
          const resp =
            await mitraMembersService.mitraMembersUpdateVerificationStatus(
              memberId,
              "approved"
            );
          showNotification(resp.message, "success");
          refetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal memverifikasi mitra",
            "error"
          );
          throw err;
        }
      },
    });
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

  if (error || !member) {
    return (
      <div className="w-full">
        <FormCard>
          <FormCardError
            message={error || "Mitra not found"}
            title="Failed to load mitra"
            backHref={backUrl}
            backLabel="Back to Mitra"
          />
        </FormCard>
      </div>
    );
  }

  const mitra = member.mitra;
  const verificationStatus = mitra?.verification_status || "pending";

  return (
    <div className="w-full space-y-6">
      <DetailCard>
        <DetailCardHeader
          title={member.name}
          description={mitra?.service_category?.name || "No category assigned"}
          badge={verificationStatus}
          badgeVariant={STATUS_VARIANT[verificationStatus] || "neutral"}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                href={backUrl}
                className="gap-1.5"
              >
                <ArrowLeft size={14} />
                Back
              </Button>
              <Button
                variant="primary"
                size="sm"
                href={PATHS.mitraMembersEdit(memberId)}
                className="gap-1.5 shadow-md shadow-primary-200/60"
              >
                <Pencil size={14} />
                Edit
              </Button>
              {mitra && verificationStatus === "pending" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 hover:text-success-600 hover:bg-success-50 hover:border-transparent"
                  aria-label="Verify"
                  onClick={handleVerify}
                >
                  <ShieldCheck size={14} />
                  Verify
                </Button>
              )}
            </div>
          }
        />

        <DetailCardBody>
          {/* Account Information */}
          <DetailSection title="Account Information">
            <DetailFieldGrid columns={3}>
              <DetailField label="Full Name" value={member.name} />
              <DetailField label="Email" value={member.email} />
              <DetailField label="Phone" value={member.phone} />
              <DetailField
                label="Email Verified"
                value={
                  <Badge
                    variant={member.is_verified ? "success" : "warning"}
                    showDot={false}
                  >
                    {member.is_verified ? "Verified" : "Unverified"}
                  </Badge>
                }
              />
              <DetailField
                label="Online Status"
                value={
                  <Badge
                    variant={mitra?.is_online ? "success" : "neutral"}
                    showDot={false}
                  >
                    {mitra?.is_online ? "Online" : "Offline"}
                  </Badge>
                }
              />
              <DetailField
                label="Joined"
                value={new Date(member.created_at).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            </DetailFieldGrid>
          </DetailSection>

          {/* Mitra Profile */}
          {mitra && (
            <DetailSection title="Mitra Profile">
              <DetailFieldGrid columns={3}>
                <DetailField label="NIK" value={mitra.nik} />
                <DetailField
                  label="Service Category"
                  value={mitra.service_category?.name}
                />
                <DetailField
                  label="Verification Status"
                  value={
                    <Badge
                      variant={
                        STATUS_VARIANT[mitra.verification_status] || "neutral"
                      }
                      showDot={false}
                    >
                      {mitra.verification_status}
                    </Badge>
                  }
                />
                <DetailField
                  label="Address"
                  value={mitra.address}
                  className="md:col-span-2 lg:col-span-3"
                />
                <DetailField
                  label="Latitude"
                  value={mitra.latitude?.toString()}
                />
                <DetailField
                  label="Longitude"
                  value={mitra.longitude?.toString()}
                />
              </DetailFieldGrid>
            </DetailSection>
          )}

          {/* Documents */}
          {mitra && (
            <DetailSection title="Documents">
              <DetailImageGrid
                images={[
                  { label: "Profile Photo", src: mitra.photo },
                  { label: "KTP Photo", src: mitra.ktp_photo },
                  { label: "Selfie with KTP", src: mitra.selfie_ktp_photo },
                  { label: "SKCK Document", src: mitra.skck_photo },
                ]}
                columns={4}
              />
            </DetailSection>
          )}
        </DetailCardBody>
      </DetailCard>
    </div>
  );
}
