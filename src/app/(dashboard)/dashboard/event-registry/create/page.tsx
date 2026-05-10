"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { FormInput } from "@app/components/ui/FormInput";
import { FormSelect } from "@app/components/ui/FormSelect";
import { Button } from "@app/components/ui/Button";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
} from "@app/components/ui/FormCard";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { PATHS } from "@config/routing";
import { eventRegistryService } from "@services/marketing/event-registry";
import type { IEventRegistryCreatePayload } from "@services/marketing/event-registry";

const CATEGORY_OPTIONS = [
  { label: "Engagement", value: "engagement" },
  { label: "Marketing", value: "marketing" },
  { label: "Transaction", value: "transaction" },
];

export default function EventRegistryCreatePage() {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [form, setForm] = useState<IEventRegistryCreatePayload>({
    key: "",
    label: "",
    category: "engagement",
    description: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);
    try {
      const resp = await eventRegistryService.create(form);
      showNotification(resp.message, "success");
      router.push(PATHS.eventRegistry);
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
          title="Create Event"
          description="Register a new trackable event."
          badge="Event Registry"
        />
        <form onSubmit={handleSubmit}>
          <FormCardBody>
            <FormInput
              id="key"
              label="Event Key"
              placeholder="e.g. cart_abandoned"
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              error={formErrors.key}
            />
            <FormInput
              id="label"
              label="Label"
              placeholder="e.g. Cart Abandoned"
              value={form.label}
              onChange={(e) =>
                setForm((f) => ({ ...f, label: e.target.value }))
              }
              error={formErrors.label}
            />
            <FormSelect
              id="category"
              label="Category"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target
                    .value as IEventRegistryCreatePayload["category"],
                }))
              }
              options={CATEGORY_OPTIONS}
              error={formErrors.category}
            />
            <FormInput
              id="description"
              label="Description"
              placeholder="When is this event fired?"
              value={form.description || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              error={formErrors.description}
            />
          </FormCardBody>
          <FormCardFooter>
            <Button
              type="button"
              variant="ghost"
              href={PATHS.eventRegistry}
              className="px-6 font-medium"
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
              Create Event
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
