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
import { Badge } from "@app/components/ui/Table";
import {
  salesMembersService,
  ISalesUser,
  ISalesUpdatePayload,
} from "@services/backoffice/sales-members";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PATHS } from "@config/routing";
import { Check } from "lucide-react";

function toFormData(member: ISalesUser): ISalesUpdatePayload {
  return {
    name: member.name,
    email: member.email,
    phone: member.phone || "",
    password: "",
  };
}

export default function SalesMemberEditPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const memberId = Number(params.id);
  const returnPage = searchParams.get("returnPage");

  const backUrl = returnPage
    ? `${PATHS.salesMembers}?page=${returnPage}`
    : PATHS.salesMembers;

  const fetcher = useCallback(
    () => salesMembersService.salesMembersDetail(memberId),
    [memberId]
  );

  const {
    data: member,
    isLoading,
    error,
  } = useDetailData<ISalesUser>({
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
            message={error || "Sales member not found"}
            title="Failed to load sales member"
            backHref={backUrl}
            backLabel="Back to Sales Members"
          />
        </FormCard>
      </div>
    );
  }

  return (
    <SalesMemberEditForm
      member={member}
      memberId={memberId}
      backUrl={backUrl}
    />
  );
}

function SalesMemberEditForm({
  member,
  memberId,
  backUrl,
}: {
  member: ISalesUser;
  memberId: number;
  backUrl: string;
}) {
  const router = useRouter();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );
  const [formData, setFormData] = useState<ISalesUpdatePayload>(() =>
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

      const payload: ISalesUpdatePayload = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }

      const resp = await salesMembersService.salesMembersUpdate(
        memberId,
        payload
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
          title="Edit Sales Member"
          description="Update sales member profile. Leave password empty to keep the current one."
          actions={
            <Badge variant="primary" showDot={false}>
              {member.sales_id}
            </Badge>
          }
        />

        <form onSubmit={handleSubmit}>
          <FormCardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormInput
                id="name"
                label="Full Name"
                placeholder="e.g. Adi Pratama"
                value={formData.name}
                onChange={handleChange}
                error={formErrors.name}
              />

              <FormInput
                id="email"
                type="email"
                label="Email Address"
                placeholder="adi@example.com"
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

              <FormInput
                id="password"
                type="password"
                label="New Password"
                placeholder="Leave empty to keep current"
                value={formData.password}
                onChange={handleChange}
                error={formErrors.password}
              />
            </div>

            <div className="pt-16" />
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
