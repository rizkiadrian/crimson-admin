"use client";

import React, { useState, useEffect } from "react";
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
import { vouchersService } from "@services/backoffice/vouchers";
import { serviceCategoriesService } from "@services/backoffice/service-categories";
import type { IServiceCategory } from "@services/backoffice/service-categories/service-categories.types";
import type {
  DiscountType,
  TargetUserType,
  DistributionType,
  SegmentType,
} from "@services/backoffice/vouchers/vouchers.types";

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed Amount", value: "fixed_amount" },
  { label: "Free Service", value: "free_service" },
  { label: "Commission Discount", value: "commission_discount" },
];

const TARGET_USER_TYPE_OPTIONS = [
  { label: "Client", value: "client" },
  { label: "Mitra", value: "mitra" },
  { label: "All", value: "all" },
];

const DISTRIBUTION_TYPE_OPTIONS = [
  { label: "Public Code", value: "public_code" },
  { label: "Auto Assign", value: "auto_assign" },
  { label: "Both", value: "both" },
];

const SEGMENT_TYPE_OPTIONS = [
  { label: "All Users", value: "all" },
  { label: "New User", value: "new_user" },
  { label: "Verified Only", value: "verified_only" },
  { label: "Specific Users", value: "specific_users" },
];

interface VoucherFormData {
  name: string;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: string;
  max_discount_cap: string;
  service_category_id: string;
  starts_at: string;
  expires_at: string;
  quota: string;
  per_user_limit: string;
  min_transaction_amount: string;
  distribution_type: DistributionType;
  target_user_type: TargetUserType;
  segment_type: SegmentType;
  user_ids: string;
}

export default function VoucherCreatePage() {
  return <VoucherCreateForm />;
}

function VoucherCreateForm() {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [formData, setFormData] = useState<VoucherFormData>({
    name: "",
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    max_discount_cap: "",
    service_category_id: "",
    starts_at: "",
    expires_at: "",
    quota: "",
    per_user_limit: "1",
    min_transaction_amount: "",
    distribution_type: "public_code",
    target_user_type: "all",
    segment_type: "all",
    user_ids: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serviceCategories, setServiceCategories] = useState<
    IServiceCategory[]
  >([]);

  // Fetch service categories for free_service discount type
  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const resp = await serviceCategoriesService.list({ per_page: 100 });
        if (!cancelled) {
          setServiceCategories(resp.data);
        }
      } catch {
        // Silently fail — categories are only needed for free_service type
      }
    };
    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // When discount_type is commission_discount, force target_user_type to mitra
  useEffect(() => {
    if (formData.discount_type === "commission_discount") {
      setFormData((prev) => ({ ...prev, target_user_type: "mitra" }));
    }
  }, [formData.discount_type]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear field error on change
    if (formErrors[id]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    try {
      setSubmitting(true);

      // Build payload
      const payload: Record<string, unknown> = {
        name: formData.name,
        description: formData.description || null,
        discount_type: formData.discount_type,
        distribution_type: formData.distribution_type,
        target_user_type: formData.target_user_type,
        starts_at: formData.starts_at,
        expires_at: formData.expires_at,
        per_user_limit: formData.per_user_limit
          ? Number(formData.per_user_limit)
          : 1,
      };

      // Code — only when distribution_type requires it
      if (
        formData.distribution_type === "public_code" ||
        formData.distribution_type === "both"
      ) {
        payload.code = formData.code;
      }

      // Discount value — not needed for free_service
      if (formData.discount_type !== "free_service") {
        payload.discount_value = formData.discount_value
          ? Number(formData.discount_value)
          : null;
      }

      // Max discount cap — only for percentage
      if (formData.discount_type === "percentage") {
        payload.max_discount_cap = formData.max_discount_cap
          ? Number(formData.max_discount_cap)
          : null;
      }

      // Service category — for free_service
      if (formData.discount_type === "free_service") {
        payload.service_category_id = formData.service_category_id
          ? Number(formData.service_category_id)
          : null;
      }

      // Optional fields
      if (formData.quota) {
        payload.quota = Number(formData.quota);
      }
      if (formData.min_transaction_amount) {
        payload.min_transaction_amount = Number(
          formData.min_transaction_amount
        );
      }

      // Target segment
      payload.segment_type = formData.segment_type;
      if (
        formData.segment_type === "specific_users" &&
        formData.user_ids.trim()
      ) {
        payload.user_ids = formData.user_ids
          .split(",")
          .map((id) => Number(id.trim()))
          .filter((id) => !isNaN(id));
      }

      const resp = await vouchersService.create(payload);
      showNotification(resp.message || "Voucher berhasil dibuat", "success");
      router.push(PATHS.vouchers);
    } catch (err: unknown) {
      handleFormError(err, setFormErrors);
    } finally {
      setSubmitting(false);
    }
  };

  // Derived state
  const showCodeField =
    formData.distribution_type === "public_code" ||
    formData.distribution_type === "both";
  const showDiscountValue = formData.discount_type !== "free_service";
  const showMaxDiscountCap = formData.discount_type === "percentage";
  const showServiceCategory = formData.discount_type === "free_service";
  const isCommissionDiscount = formData.discount_type === "commission_discount";
  const showUserPicker = formData.segment_type === "specific_users";

  const serviceCategoryOptions = serviceCategories.map((cat) => ({
    label: cat.name,
    value: String(cat.id),
  }));

  return (
    <div className="w-full">
      <FormCard>
        <FormCardHeader
          title="Create Voucher"
          description="Buat voucher baru untuk marketplace Lingkar. Konfigurasi tipe diskon, kondisi, dan target pengguna."
          badge="Voucher Management"
        />

        <form onSubmit={handleSubmit}>
          <FormCardBody>
            {/* Section 1 — Basic Info */}
            <div>
              <p className="text-xs text-secondary-500 uppercase font-medium mb-4 tracking-wide">
                Basic Info
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormInput
                  id="name"
                  label="Voucher Name"
                  placeholder="e.g. Diskon Akhir Tahun"
                  value={formData.name}
                  onChange={handleChange}
                  error={formErrors.name}
                  maxLength={255}
                />

                {showCodeField && (
                  <FormInput
                    id="code"
                    label="Voucher Code"
                    placeholder="e.g. NEWYEAR2024"
                    value={formData.code}
                    onChange={handleChange}
                    error={formErrors.code}
                    maxLength={50}
                  />
                )}
              </div>

              <div className="mt-6">
                <FormInput
                  id="description"
                  as="textarea"
                  label="Description"
                  placeholder="Deskripsi voucher (opsional)"
                  value={formData.description}
                  onChange={handleChange}
                  error={formErrors.description}
                />
              </div>
            </div>

            {/* Section 2 — Discount Config */}
            <div>
              <p className="text-xs text-secondary-500 uppercase font-medium mb-4 tracking-wide">
                Discount Configuration
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormSelect
                  id="discount_type"
                  label="Discount Type"
                  value={formData.discount_type}
                  onChange={handleChange}
                  options={DISCOUNT_TYPE_OPTIONS}
                  error={formErrors.discount_type}
                />

                {showDiscountValue && (
                  <FormInput
                    id="discount_value"
                    label={
                      formData.discount_type === "fixed_amount"
                        ? "Discount Value (Rp)"
                        : "Discount Value (%)"
                    }
                    placeholder={
                      formData.discount_type === "fixed_amount"
                        ? "e.g. 50000"
                        : "e.g. 20"
                    }
                    type="number"
                    value={formData.discount_value}
                    onChange={handleChange}
                    error={formErrors.discount_value}
                    min={formData.discount_type === "fixed_amount" ? 1 : 1}
                    max={
                      formData.discount_type === "fixed_amount"
                        ? undefined
                        : 100
                    }
                  />
                )}

                {showMaxDiscountCap && (
                  <FormInput
                    id="max_discount_cap"
                    label="Max Discount Cap (Rp)"
                    placeholder="e.g. 100000"
                    type="number"
                    value={formData.max_discount_cap}
                    onChange={handleChange}
                    error={formErrors.max_discount_cap}
                    min={1}
                  />
                )}

                {showServiceCategory && (
                  <FormSelect
                    id="service_category_id"
                    label="Service Category"
                    value={formData.service_category_id}
                    onChange={handleChange}
                    options={serviceCategoryOptions}
                    placeholder="Select service category"
                    error={formErrors.service_category_id}
                  />
                )}
              </div>
            </div>

            {/* Section 3 — Conditions & Limits */}
            <div>
              <p className="text-xs text-secondary-500 uppercase font-medium mb-4 tracking-wide">
                Conditions & Limits
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormInput
                  id="starts_at"
                  label="Start Date"
                  format="date"
                  placeholder="Select start date"
                  value={formData.starts_at}
                  onChange={handleChange}
                  error={formErrors.starts_at}
                />

                <FormInput
                  id="expires_at"
                  label="Expiry Date"
                  format="date"
                  placeholder="Select expiry date"
                  value={formData.expires_at}
                  onChange={handleChange}
                  error={formErrors.expires_at}
                />

                <FormInput
                  id="quota"
                  label="Quota (optional)"
                  placeholder="Leave empty for unlimited"
                  type="number"
                  value={formData.quota}
                  onChange={handleChange}
                  error={formErrors.quota}
                  min={1}
                />

                <FormInput
                  id="per_user_limit"
                  label="Per User Limit"
                  placeholder="Default: 1"
                  type="number"
                  value={formData.per_user_limit}
                  onChange={handleChange}
                  error={formErrors.per_user_limit}
                  min={1}
                />

                <FormInput
                  id="min_transaction_amount"
                  label="Min Transaction Amount (optional)"
                  placeholder="e.g. 100000"
                  type="number"
                  value={formData.min_transaction_amount}
                  onChange={handleChange}
                  error={formErrors.min_transaction_amount}
                  min={0}
                />
              </div>
            </div>

            {/* Section 4 — Distribution */}
            <div>
              <p className="text-xs text-secondary-500 uppercase font-medium mb-4 tracking-wide">
                Distribution
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormSelect
                  id="distribution_type"
                  label="Distribution Type"
                  value={formData.distribution_type}
                  onChange={handleChange}
                  options={DISTRIBUTION_TYPE_OPTIONS}
                  error={formErrors.distribution_type}
                />
              </div>
            </div>

            {/* Section 5 — Target Segment */}
            <div>
              <p className="text-xs text-secondary-500 uppercase font-medium mb-4 tracking-wide">
                Target Segment
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormSelect
                  id="target_user_type"
                  label="Target User Type"
                  value={formData.target_user_type}
                  onChange={handleChange}
                  options={TARGET_USER_TYPE_OPTIONS}
                  error={formErrors.target_user_type}
                  disabled={isCommissionDiscount}
                />

                <FormSelect
                  id="segment_type"
                  label="Segment Type"
                  value={formData.segment_type}
                  onChange={handleChange}
                  options={SEGMENT_TYPE_OPTIONS}
                  error={formErrors.segment_type}
                />

                {showUserPicker && (
                  <FormInput
                    id="user_ids"
                    label="User IDs"
                    placeholder="Comma-separated user IDs, e.g. 1, 2, 3"
                    value={formData.user_ids}
                    onChange={handleChange}
                    error={formErrors.user_ids}
                  />
                )}
              </div>
            </div>

            <div className="pt-4" />
          </FormCardBody>

          <FormCardFooter>
            <Button
              type="button"
              variant="ghost"
              href={PATHS.vouchers}
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
              Create Voucher
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
