"use client";

import React, { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Check, Upload, AlertCircle } from "lucide-react";
import { FormInput } from "@app/components/ui/FormInput";
import {
  FormCheckbox,
  FormCheckboxGroup,
} from "@app/components/ui/FormCheckbox";
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
import { serviceCategoriesService } from "@services/backoffice/service-categories";
import type {
  IServiceCategory,
  CategoryType,
} from "@services/backoffice/service-categories";
import type { CustomApiError } from "@lib/api";

/** Available category type options */
const CATEGORY_TYPE_OPTIONS: { label: string; value: CategoryType }[] = [
  { label: "General", value: "general" },
  { label: "Daily", value: "daily" },
  { label: "Monthly", value: "monthly" },
  { label: "Popular", value: "popular" },
];

/** Max icon file size: 2MB */
const MAX_ICON_SIZE = 2 * 1024 * 1024;

// ─── Page (loading/error shell) ───────────────────────────────────────────────

export default function ServiceCategoryEditPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = Number(params.id);
  const returnPage = searchParams.get("returnPage");

  /** Build the back URL preserving the page the user came from. */
  const backUrl = returnPage
    ? `${PATHS.serviceCategories}?page=${returnPage}`
    : PATHS.serviceCategories;

  const fetcher = useCallback(
    () => serviceCategoriesService.detail(categoryId),
    [categoryId]
  );

  const {
    data: category,
    isLoading,
    error,
  } = useDetailData<IServiceCategory>({
    fetcher,
    enabled: !!categoryId,
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

  if (error || !category) {
    return (
      <div className="w-full">
        <FormCard>
          <FormCardError
            message={error || "Service category not found"}
            title="Failed to load service category"
            backHref={backUrl}
            backLabel="Back to Service Categories"
          />
        </FormCard>
      </div>
    );
  }

  return (
    <ServiceCategoryEditForm
      initialData={category}
      categoryId={categoryId}
      backUrl={backUrl}
    />
  );
}

// ─── Inner form (pre-filled, per ADR-01) ─────────────────────────────────────

function ServiceCategoryEditForm({
  initialData,
  categoryId,
  backUrl,
}: {
  initialData: IServiceCategory;
  categoryId: number;
  backUrl: string;
}) {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);

  // Form fields — pre-populated from existing data
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description ?? "");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(null);
  const [iconError, setIconError] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<CategoryType[]>(
    () => initialData.types ?? []
  );
  const [isActive, setIsActive] = useState(initialData.is_active);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // --- Icon file handler ---
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIconError(null);

      // Validate file type — must be SVG
      if (file.type !== "image/svg+xml" && !file.name.endsWith(".svg")) {
        setIconError("File harus berformat SVG.");
        return;
      }

      // Validate file size — max 2MB
      if (file.size > MAX_ICON_SIZE) {
        setIconError("Ukuran file tidak boleh lebih dari 2MB.");
        return;
      }

      // Clean up previous preview URL
      if (iconPreviewUrl) {
        URL.revokeObjectURL(iconPreviewUrl);
      }

      setIconFile(file);
      setIconPreviewUrl(URL.createObjectURL(file));
    },
    [iconPreviewUrl]
  );

  // --- Client-side validation ---
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    } else if (name.length > 255) {
      errors.name = "Name must not exceed 255 characters";
    }

    if (iconFile) {
      if (
        iconFile.type !== "image/svg+xml" &&
        !iconFile.name.endsWith(".svg")
      ) {
        errors.icon = "File harus berformat SVG";
      } else if (iconFile.size > MAX_ICON_SIZE) {
        errors.icon = "Ukuran file tidak boleh lebih dari 2MB";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (!validate()) return;

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", name.trim());

      if (description.trim()) {
        formData.append("description", description.trim());
      }

      if (iconFile) {
        formData.append("icon", iconFile);
      }

      selectedTypes.forEach((type) => {
        formData.append("types[]", type);
      });

      formData.append("is_active", isActive ? "1" : "0");

      const resp = await serviceCategoriesService.update(categoryId, formData);
      showNotification(resp.message, "success");
      router.push(backUrl);
    } catch (err: unknown) {
      const apiError = err as CustomApiError;
      handleFormError(err, setFormErrors);
      // Show toast for general errors (no field-level errors)
      if (!apiError?.errors) {
        showNotification(
          apiError?.message || "Terjadi kesalahan server",
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <FormCard>
        <FormCardHeader
          title="Edit Service Category"
          description="Update the service category details. Leave the icon unchanged to keep the current one."
          badge="Service Categories"
        />

        <form onSubmit={handleSubmit}>
          <FormCardBody>
            {/* Name & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormInput
                id="name"
                label="Name"
                placeholder="e.g. Plumbing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={formErrors.name}
                maxLength={255}
                required
              />

              <FormInput
                id="description"
                label="Description"
                as="textarea"
                placeholder="Optional description for this category"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={formErrors.description}
              />
            </div>

            {/* Icon Upload */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-secondary-500 uppercase font-medium mb-2 tracking-wide">
                  Icon
                </p>
                <p className="text-xs text-secondary-400 mb-3">
                  SVG format only. Max 2MB. Leave unchanged to keep the current
                  icon.
                </p>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload category icon"
                />

                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} className="mr-2" />
                  {iconFile ? "Change Icon" : "Replace Icon"}
                </Button>

                {/* Error messages */}
                {(iconError || formErrors.icon) && (
                  <div className="mt-2 flex items-center gap-1.5 text-error-600">
                    <AlertCircle size={14} />
                    <p className="text-xs font-medium">
                      {iconError || formErrors.icon}
                    </p>
                  </div>
                )}
              </div>

              {/* New icon preview (if uploaded) */}
              {iconPreviewUrl && (
                <div>
                  <p className="text-xs text-secondary-500 uppercase font-medium mb-2 tracking-wide">
                    New Icon Preview
                  </p>
                  <div className="rounded-lg border border-border-subtle overflow-hidden inline-block p-4 bg-neutral-50">
                    <Image
                      src={iconPreviewUrl}
                      alt="New icon preview"
                      width={64}
                      height={64}
                      className="block w-16 h-16 object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              {/* Current icon (show if exists and no new icon uploaded) */}
              {initialData.icon && !iconPreviewUrl && (
                <div>
                  <p className="text-xs text-secondary-500 uppercase font-medium mb-2 tracking-wide">
                    Current Icon
                  </p>
                  <div className="rounded-lg border border-border-subtle overflow-hidden inline-block p-4 bg-neutral-50">
                    <Image
                      src={initialData.icon}
                      alt="Current category icon"
                      width={64}
                      height={64}
                      className="block w-16 h-16 object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Types — Multi-checkbox group */}
            <FormCheckboxGroup
              label="Types"
              options={CATEGORY_TYPE_OPTIONS}
              value={selectedTypes}
              onChange={setSelectedTypes}
              error={formErrors.types}
            />

            {/* Is Active — Toggle/checkbox */}
            <div>
              <p className="text-xs text-secondary-500 uppercase font-medium mb-3 tracking-wide">
                Status
              </p>
              <FormCheckbox
                id="is_active"
                label="Active"
                checked={isActive}
                onChange={setIsActive}
              />
              {formErrors.is_active && (
                <p className="mt-1.5 text-xs font-medium text-error-600">
                  {formErrors.is_active}
                </p>
              )}
            </div>

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
