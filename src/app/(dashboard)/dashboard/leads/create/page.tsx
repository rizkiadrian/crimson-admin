"use client";

import React, { useEffect, useState } from "react";
import { FormInput } from "@app/components/ui/FormInput";
import { FormSelect } from "@app/components/ui/FormSelect";
import { Button } from "@app/components/ui/Button";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
} from "@app/components/ui/FormCard";
import { leadsService, ILeadCreatePayload } from "@services/backoffice/leads";
import {
  salesMembersService,
  ISalesListItem,
} from "@services/backoffice/sales-members";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { useRouter } from "next/navigation";
import { PATHS } from "@config/routing";
import { Check } from "lucide-react";

const TYPE_OPTIONS = [
  { label: "Client", value: "client" },
  { label: "Mitra", value: "mitra" },
];

const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

const STATUS_OPTIONS = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Proposal", value: "proposal" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
];

const INITIAL_FORM: ILeadCreatePayload = {
  type: "client",
  name: "",
  source: "",
  email: "",
  phone: "",
  address: "",
  priority: "medium",
  status: "new",
  notes: "",
  assigned_sales_id: null,
};

export default function LeadCreatePage() {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [formData, setFormData] = useState<ILeadCreatePayload>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [salesList, setSalesList] = useState<ISalesListItem[]>([]);

  useEffect(() => {
    salesMembersService.salesMembersList().then((res) => {
      setSalesList(res.data ?? []);
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormErrors({});

      // Strip empty optional fields
      const payload: ILeadCreatePayload = {
        ...formData,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
        assigned_sales_id: formData.assigned_sales_id || null,
      };

      const resp = await leadsService.leadsCreate(payload);
      showNotification(resp.message, "success");
      router.push(PATHS.leads);
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
          title="New Lead"
          description="Add a new prospect to the pipeline. Fill in the required information below."
          badge="Sales Management"
        />

        <form onSubmit={handleSubmit}>
          <FormCardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Type */}
              <FormSelect
                id="type"
                label="Lead Type"
                value={formData.type}
                onChange={handleChange}
                options={TYPE_OPTIONS}
                error={formErrors.type}
              />

              {/* Priority */}
              <FormSelect
                id="priority"
                label="Priority"
                value={formData.priority ?? "medium"}
                onChange={handleChange}
                options={PRIORITY_OPTIONS}
                error={formErrors.priority}
              />

              {/* Name */}
              <FormInput
                id="name"
                label="Full Name / Company"
                placeholder="e.g. Acme Corp"
                value={formData.name}
                onChange={handleChange}
                error={formErrors.name}
              />

              {/* Source */}
              <FormInput
                id="source"
                label="Lead Source"
                placeholder="e.g. Website Form, Referral, Cold Call"
                value={formData.source}
                onChange={handleChange}
                error={formErrors.source}
              />

              {/* Email */}
              <FormInput
                id="email"
                type="email"
                label="Email Address"
                placeholder="contact@example.com"
                value={formData.email}
                onChange={handleChange}
                error={formErrors.email}
              />

              {/* Phone */}
              <FormInput
                id="phone"
                type="tel"
                label="Phone Number"
                placeholder="+62 812 3456 7890"
                format="phone"
                value={formData.phone}
                onChange={handleChange}
                error={formErrors.phone}
              />

              {/* Status */}
              <FormSelect
                id="status"
                label="Initial Status"
                value={formData.status ?? "new"}
                onChange={handleChange}
                options={STATUS_OPTIONS}
                error={formErrors.status}
              />

              {/* Assign to Sales */}
              <FormSelect
                id="assigned_sales_id"
                label="Assign to Sales"
                value={
                  formData.assigned_sales_id
                    ? String(formData.assigned_sales_id)
                    : ""
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    assigned_sales_id: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                options={salesList.map((s) => ({
                  label: `${s.name} (${s.sales_id})`,
                  value: String(s.id),
                }))}
                placeholder="Unassigned"
                error={formErrors.assigned_sales_id}
              />

              {/* Address */}
              <FormInput
                id="address"
                label="Address"
                placeholder="Full address (optional)"
                value={formData.address}
                onChange={handleChange}
                error={formErrors.address}
              />
            </div>

            {/* Notes — full width */}
            <div className="mt-6">
              <label
                htmlFor="notes"
                className="block text-xs text-secondary-500 uppercase font-medium mb-2 tracking-wide"
              >
                Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Additional notes or context about this lead..."
                value={formData.notes}
                onChange={handleChange}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-base text-secondary-900 placeholder:text-secondary-400 outline-none transition-colors focus:ring-2 focus:ring-secondary-900/10 focus:border-secondary-900 focus:bg-white resize-none"
              />
              {formErrors.notes && (
                <p className="mt-1.5 text-xs font-medium text-error-600">
                  {formErrors.notes}
                </p>
              )}
            </div>

            <div className="pt-8" />
          </FormCardBody>

          <FormCardFooter>
            <Button
              type="button"
              variant="ghost"
              href={PATHS.leads}
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
              Create Lead
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
