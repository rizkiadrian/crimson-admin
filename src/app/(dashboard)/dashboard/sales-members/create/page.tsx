"use client";

import React, { useState } from "react";
import { FormInput } from "@app/components/ui/FormInput";
import { Button } from "@app/components/ui/Button";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
} from "@app/components/ui/FormCard";
import {
  salesMembersService,
  ISalesCreatePayload,
} from "@services/backoffice/sales-members";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { useRouter } from "next/navigation";
import { PATHS } from "@config/routing";
import { Check } from "lucide-react";

export default function SalesMemberCreatePage() {
  const router = useRouter();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );
  const [formData, setFormData] = useState<ISalesCreatePayload>({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setSubmitting(true);
      const resp = await salesMembersService.salesMembersCreate(formData);
      showNotification(resp.message, "success");
      router.push(PATHS.salesMembers);
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
          title="Add Sales Member"
          description="Register a new sales member. A unique Sales ID (e.g. SLS-0021) will be auto-generated."
          badge="Sales Role"
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
                placeholder="adi.pratama@example.com"
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
                label="Password"
                placeholder="Set initial password"
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
              href={PATHS.salesMembers}
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
              Register Sales Member
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
