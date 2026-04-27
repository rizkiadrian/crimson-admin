"use client";

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
} from "@app/components/ui/FormCard";
import { FormInput } from "@app/components/ui/FormInput";
import { FormSelect } from "@app/components/ui/FormSelect";
import type { FormSelectOption } from "@app/components/ui/FormSelect";
import { Button } from "@app/components/ui/Button";
import { activeLeadsService } from "@services/sales/active-leads";

// Dummy type based on StoreActivityLogRequest
interface ActivityReportForm {
  lead_id: string;
  type: string;
  title: string;
  description: string;
  attachment: File | null;
  metadata: {
    requested_status: string;
    requested_sales_id: string;
  };
}

export default function CreateSalesActivityReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ─── Lead search state ───────────────────────────────────────────────────
  const [leadOptions, setLeadOptions] = useState<FormSelectOption[]>([]);
  const [isLeadLoading, setIsLeadLoading] = useState(false);
  const leadSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState<ActivityReportForm>({
    lead_id: "",
    type: "general_note",
    title: "",
    description: "",
    attachment: null,
    metadata: {
      requested_status: "",
      requested_sales_id: "",
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Handle nested metadata fields
    if (name.startsWith("metadata.")) {
      const metaKey = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metaKey]: value,
        },
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, attachment: e.target.files![0] }));
    }
  };

  // ─── Debounced lead search ───────────────────────────────────────────────
  const handleLeadSearch = useCallback((query: string) => {
    if (leadSearchTimer.current) clearTimeout(leadSearchTimer.current);

    if (!query.trim()) {
      setLeadOptions([]);
      setIsLeadLoading(false);
      return;
    }

    setIsLeadLoading(true);
    leadSearchTimer.current = setTimeout(async () => {
      try {
        const res = await activeLeadsService.getActiveLeads({ search: query });
        const opts: FormSelectOption[] = (res.data ?? []).map((lead) => ({
          label: `${lead.lead_id} — ${lead.name}`,
          value: String(lead.id),
        }));
        setLeadOptions(opts);
      } catch {
        setLeadOptions([]);
      } finally {
        setIsLeadLoading(false);
      }
    }, 350);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    // Template only - no submit function implementation requested
    console.warn("Form Submitted: ", form);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <FormCard>
          <FormCardHeader
            title="Create Activity Report"
            description="Log a new sales activity or request updates"
          />
          <FormCardBody className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSelect
                id="type"
                label="Activity Type"
                value={form.type}
                onChange={handleChange}
                error={formErrors.type}
                options={[
                  { label: "General Note", value: "general_note" },
                  {
                    label: "Request Lead Assign",
                    value: "request_lead_assign",
                  },
                  {
                    label: "Request Update Lead Status",
                    value: "request_update_lead_status",
                  },
                ]}
              />

              <FormSelect
                id="lead_id"
                label="Lead ID (Optional)"
                value={form.lead_id}
                onChange={handleChange}
                options={leadOptions}
                placeholder="Search lead by name or ID"
                error={formErrors.lead_id}
                onSearch={handleLeadSearch}
                isLoading={isLeadLoading}
                searchPlaceholder="Type to search leads..."
              />
            </div>

            <FormInput
              id="title"
              name="title"
              label="Title"
              placeholder="E.g. Follow up call with client"
              value={form.title}
              onChange={handleChange}
              error={formErrors.title}
              required
            />

            {/* Conditional Fields based on Activity Type */}
            {form.type === "request_update_lead_status" && (
              <FormSelect
                id="metadata.requested_status"
                label="Requested Lead Status"
                value={form.metadata.requested_status}
                onChange={handleChange}
                error={formErrors["metadata.requested_status"]}
                options={[
                  { label: "New", value: "new" },
                  { label: "Contacted", value: "contacted" },
                  { label: "Qualified", value: "qualified" },
                  { label: "Proposal", value: "proposal" },
                  { label: "Negotiation", value: "negotiation" },
                  { label: "Won", value: "won" },
                  { label: "Lost", value: "lost" },
                ]}
              />
            )}

            {form.type === "request_lead_assign" && (
              <FormInput
                id="metadata.requested_sales_id"
                name="metadata.requested_sales_id"
                label="Requested Sales Member ID"
                placeholder="Enter Sales User ID"
                value={form.metadata.requested_sales_id}
                onChange={handleChange}
                error={formErrors["metadata.requested_sales_id"]}
              />
            )}

            <FormInput
              id="description"
              name="description"
              label="Description"
              as="textarea"
              placeholder="Provide detailed activity logs or notes..."
              value={form.description}
              onChange={handleChange}
              error={formErrors.description}
            />

            <FormInput
              id="attachment"
              name="attachment"
              type="file"
              label="Attachment"
              onChange={handleFileChange}
              error={formErrors.attachment}
              accept=".jpeg,.png,.jpg,.pdf,.doc,.docx"
            />
          </FormCardBody>

          <FormCardFooter>
            <Button variant="ghost" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Submit Report
            </Button>
          </FormCardFooter>
        </FormCard>
      </form>
    </div>
  );
}
