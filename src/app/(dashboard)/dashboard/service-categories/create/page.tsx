"use client";

import React, { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
} from "@app/components/ui/FormCard";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { PATHS } from "@config/routing";
import { serviceCategoriesService } from "@services/backoffice/service-categories";
import type { CategoryType } from "@services/backoffice/service-categories";
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

export default function ServiceCategoryCreatePage() {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(null);
  const [iconError, setIconError] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<CategoryType[]>([]);
  const [isActive, setIsActive] = useState(false);
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

      const resp = await serviceCategoriesService.create(formData);
      showNotification(resp.message, "success");
      router.push(PATHS.serviceCategories);
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
          title="Create Service Category"
          description="Add a new service category to the system."
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
                  SVG format only. Max 2MB.
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
                  {iconFile ? "Change Icon" : "Upload Icon"}
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

              {/* Icon preview */}
              {iconPreviewUrl && (
                <div className="rounded-lg border border-border-subtle overflow-hidden inline-block p-4 bg-neutral-50">
                  <Image
                    src={iconPreviewUrl}
                    alt="Icon preview"
                    width={64}
                    height={64}
                    className="block w-16 h-16 object-contain"
                    unoptimized
                  />
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
              href={PATHS.serviceCategories}
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
              Create Service Category
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
