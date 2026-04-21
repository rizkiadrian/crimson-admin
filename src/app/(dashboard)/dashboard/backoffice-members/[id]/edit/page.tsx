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
  backofficeMembersService,
  IBackofficeUser,
  IBackofficeUpdatePayload,
} from "@services/backoffice/backoffice-members";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { useParams } from "next/navigation";
import { PATHS } from "@config/routing";
import { Check } from "lucide-react";

/**
 * Transforms raw API member data into the form's initial state.
 * Password is always empty — user must explicitly set a new one.
 */
function toFormData(member: IBackofficeUser): IBackofficeUpdatePayload {
  return {
    name: member.name,
    email: member.email,
    phone: member.phone || "",
    password: "",
  };
}

export default function BackofficeMemberEditPage() {
  const params = useParams();
  const memberId = Number(params.id);

  const fetcher = useCallback(
    () => backofficeMembersService.backofficeMembersDetail(memberId),
    [memberId]
  );

  const {
    data: member,
    isLoading,
    error,
  } = useDetailData<IBackofficeUser>({
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
            message={error || "Member not found"}
            title="Failed to load member"
            backHref={PATHS.backofficeMembers}
            backLabel="Back to Members"
          />
        </FormCard>
      </div>
    );
  }

  return <MemberEditForm member={member} />;
}

/**
 * Inner form component that only renders once member data is available.
 * This avoids the need for a useEffect to sync API data into form state —
 * the initial state is derived directly from the `member` prop.
 */
function MemberEditForm({ member }: { member: IBackofficeUser }) {
  const [formData, setFormData] = useState<IBackofficeUpdatePayload>(() =>
    toFormData(member)
  );
  const [formErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement submit logic
  };

  return (
    <div className="w-full">
      <FormCard>
        <FormCardHeader
          title="Edit Member"
          description="Update the backoffice member profile. Leave password empty to keep the current one."
          badge="Authorized only"
        />

        <form onSubmit={handleSubmit}>
          <FormCardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormInput
                id="name"
                label="Full Name"
                placeholder="e.g. Alexander Sterling"
                value={formData.name}
                onChange={handleChange}
                error={formErrors.name}
              />

              <FormInput
                id="email"
                type="email"
                label="Email Address"
                placeholder="alexander.s@vanguard.com"
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
              href={PATHS.backofficeMembers}
              className="text-text-muted hover:text-text-main hover:bg-neutral-100 px-6 font-medium"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              className="px-8 shadow-md shadow-primary-200/60"
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
