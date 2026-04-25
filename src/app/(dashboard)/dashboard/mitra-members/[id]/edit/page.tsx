"use client";

import React, { useCallback, useState } from "react";
import { FormInput } from "@app/components/ui/FormInput";
import { Button } from "@app/components/ui/Button";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";
import {
  mitraMembersService,
  IMitraUser,
  IMitraUpdatePayload,
} from "@services/backoffice/mitra-members";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PATHS } from "@config/routing";
import { Check } from "lucide-react";

function toFormData(member: IMitraUser): IMitraUpdatePayload {
  return {
    name: member.name,
    email: member.email,
    phone: member.phone || "",
  };
}

export default function MitraMemberEditPage() {
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
  } = useDetailData<IMitraUser>({
    fetcher,
    enabled: !!memberId,
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

  return (
    <MitraEditForm member={member} memberId={memberId} backUrl={backUrl} />
  );
}

function MitraEditForm({
  member,
  memberId,
  backUrl,
}: {
  member: IMitraUser;
  memberId: number;
  backUrl: string;
}) {
  const router = useRouter();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );
  const [formData, setFormData] = useState<IMitraUpdatePayload>(() =>
    toFormData(member)
  );
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormErrors({});

      const resp = await mitraMembersService.mitraMembersUpdate(
        memberId,
        formData
      );
      showNotification(resp.message, "success");
      router.push(backUrl);
    } catch (err: unknown) {
      handleFormError(err, setFormErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <FormCard>
        <FormCardHeader
          title="Edit Mitra"
          description="Update the mitra member's basic information. Mitra profile details (NIK, documents, location) are managed by the mitra themselves."
          badge={member.mitra?.verification_status || "pending"}
        />

        <form onSubmit={handleSubmit}>
          <FormCardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormInput
                id="name"
                label="Full Name"
                placeholder="e.g. Agus Setiawan"
                value={formData.name}
                onChange={handleChange}
                error={formErrors.name}
              />

              <FormInput
                id="email"
                type="email"
                label="Email Address"
                placeholder="mitra@example.com"
                value={formData.email}
                onChange={handleChange}
                error={formErrors.email}
              />

              <FormInput
                id="phone"
                type="tel"
                label="Phone Number"
                placeholder="+62 818 2012 4123"
                format="phone"
                value={formData.phone}
                onChange={handleChange}
                error={formErrors.phone}
              />
            </div>

            {/* Read-only mitra profile info */}
            {member.mitra && (
              <div className="mt-8 pt-8 border-t border-border-subtle">
                <p className="text-xs text-secondary-500 uppercase font-medium mb-4 tracking-wide">
                  Mitra Profile (Read Only)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div>
                    <span className="text-text-muted">NIK:</span>{" "}
                    <span className="font-semibold text-text-main">
                      {member.mitra.nik}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Category:</span>{" "}
                    <span className="font-semibold text-text-main">
                      {member.mitra.service_category?.name || "—"}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-text-muted">Address:</span>{" "}
                    <span className="font-semibold text-text-main">
                      {member.mitra.address}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8" />
          </FormCardBody>

          <FormCardFooter>
            <Button
              type="button"
              variant="ghost"
              href={backUrl}
              className="text-text-muted hover:text-text-main hover:bg-neutral-100 px-6 font-medium"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              className="px-8 shadow-md shadow-primary-200/60"
              isLoading={submitting}
            >
              <Check size={16} strokeWidth={2.5} className="mr-2" />
              Save Changes
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
