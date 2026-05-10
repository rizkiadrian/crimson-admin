"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Check } from "lucide-react";
import { FormInput } from "@app/components/ui/FormInput";
import { FormSelect } from "@app/components/ui/FormSelect";
import { Button } from "@app/components/ui/Button";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { PATHS } from "@config/routing";
import { eventRegistryService } from "@services/marketing/event-registry";
import type {
  IEventRegistry,
  IEventRegistryUpdatePayload,
} from "@services/marketing/event-registry";

const CATEGORY_OPTIONS = [
  { label: "Engagement", value: "engagement" },
  { label: "Marketing", value: "marketing" },
  { label: "Transaction", value: "transaction" },
];

export default function EventRegistryEditPage() {
  const params = useParams();
  const id = params.id as string;

  // Event registry doesn't have a detail endpoint, so we fetch the list and find by id
  const fetcher = useCallback(async () => {
    const resp = await eventRegistryService.list({ per_page: 100 });
    const event = resp.data.find((e) => e.id === Number(id));
    if (!event) throw new Error("Event not found");
    return {
      success: true as const,
      data: event,
      message: "Success",
      meta: { http_status: 200 },
    };
  }, [id]);

  const { data, isLoading, error } = useDetailData<IEventRegistry>({
    fetcher,
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="w-full">
        <FormCard>
          <FormCardLoading />
        </FormCard>
      </div>
    );
  if (error || !data)
    return (
      <div className="w-full">
        <FormCard>
          <FormCardError
            message={error || "Not found"}
            title="Failed to load"
            backHref={PATHS.eventRegistry}
            backLabel="Back"
          />
        </FormCard>
      </div>
    );

  return <EventEditForm initialData={data} />;
}

function EventEditForm({ initialData }: { initialData: IEventRegistry }) {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [form, setForm] = useState<IEventRegistryUpdatePayload>({
    key: initialData.key,
    label: initialData.label,
    category: initialData.category as IEventRegistryUpdatePayload["category"],
    description: initialData.description || "",
    is_active: initialData.is_active,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);
    try {
      const resp = await eventRegistryService.update(initialData.id, form);
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
          title="Edit Event"
          description={`Editing "${initialData.label}"`}
          badge="Event Registry"
        />
        <form onSubmit={handleSubmit}>
          <FormCardBody>
            <FormInput
              id="key"
              label="Event Key"
              value={form.key || ""}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              error={formErrors.key}
            />
            <FormInput
              id="label"
              label="Label"
              value={form.label || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, label: e.target.value }))
              }
              error={formErrors.label}
            />
            <FormSelect
              id="category"
              label="Category"
              value={form.category || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target
                    .value as IEventRegistryUpdatePayload["category"],
                }))
              }
              options={CATEGORY_OPTIONS}
              error={formErrors.category}
            />
            <FormInput
              id="description"
              label="Description"
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
              Update Event
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
