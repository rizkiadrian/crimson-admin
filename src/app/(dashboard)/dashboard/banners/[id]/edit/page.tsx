"use client";

import React, { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Check, Plus, Eye, Upload, AlertCircle } from "lucide-react";
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
import { bannersService } from "@services/marketing/banners";
import type {
  IBanner,
  BannerType,
  ITextElement,
  IBackgroundConfig,
  ICtaConfig,
} from "@services/marketing/banners/banners.types";
import {
  BackgroundSelector,
  CanvasEditor,
  TextPropertiesPanel,
  TemplateSelector,
  BannerPreviewModal,
  CtaPropertiesPanel,
} from "@app/components/ui/BannerEditor";
import type { CanvasEditorHandle } from "@app/components/ui/BannerEditor";

/** Expected image dimensions with tolerance */
const EXPECTED_WIDTH = 1080;
const EXPECTED_HEIGHT = 608;
const DIMENSION_TOLERANCE = 10;

/**
 * Validate image dimensions client-side.
 * Returns a promise that resolves to an error message or null if valid.
 */
function validateImageDimensions(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const widthOk =
        Math.abs(img.width - EXPECTED_WIDTH) <= DIMENSION_TOLERANCE;
      const heightOk =
        Math.abs(img.height - EXPECTED_HEIGHT) <= DIMENSION_TOLERANCE;
      URL.revokeObjectURL(img.src);
      if (!widthOk || !heightOk) {
        resolve(
          `Dimensi gambar harus ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT} piksel (toleransi ${DIMENSION_TOLERANCE}px). Gambar Anda: ${img.width}x${img.height}.`
        );
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve("Gagal membaca file gambar.");
    };
    img.src = URL.createObjectURL(file);
  });
}

// ─── Page (loading/error shell) ───────────────────────────────────────────────

export default function BannerEditPage() {
  const params = useParams();
  const bannerId = params.id as string;

  const fetcher = useCallback(
    () => bannersService.detail(bannerId),
    [bannerId]
  );

  const {
    data: banner,
    isLoading,
    error,
  } = useDetailData<IBanner>({
    fetcher,
    enabled: !!bannerId,
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

  if (error || !banner) {
    return (
      <div className="w-full">
        <FormCard>
          <FormCardError
            message={error || "Banner not found"}
            title="Failed to load banner"
            backHref={PATHS.banners}
            backLabel="Back to Banners"
          />
        </FormCard>
      </div>
    );
  }

  return <BannerEditForm initialData={banner} />;
}

// ─── Inner form (pre-filled, per ADR-01) ─────────────────────────────────────

/** Default background config fallback */
const DEFAULT_BACKGROUND: IBackgroundConfig = {
  type: "solid",
  colors: ["#1E3A5F"],
};

/** Ensure text elements have client-side IDs for React keys */
function ensureTextElementIds(elements: ITextElement[] | null): ITextElement[] {
  if (!elements || elements.length === 0) return [];
  return elements.map((el) => ({
    ...el,
    id: el.id || `text-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }));
}

const BANNER_TYPE_OPTIONS = [
  { label: "Image Upload", value: "image" },
  { label: "Text Placement", value: "text_placement" },
];

function BannerEditForm({ initialData }: { initialData: IBanner }) {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);

  // Common fields — pre-populated from existing data
  const [title, setTitle] = useState(initialData.title);
  const bannerType: BannerType = initialData.type; // Type is not editable

  // Image type state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text placement state — pre-populated from existing data
  const [textElements, setTextElements] = useState<ITextElement[]>(() =>
    ensureTextElementIds(initialData.text_elements)
  );
  const [backgroundConfig, setBackgroundConfig] = useState<IBackgroundConfig>(
    () => initialData.background_config ?? DEFAULT_BACKGROUND
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [ctaConfig, setCtaConfig] = useState<ICtaConfig | null>(
    () => initialData.cta_config ?? null
  );
  const [targetUrl, setTargetUrl] = useState(
    () => initialData.target_url ?? ""
  );
  const canvasEditorRef = useRef<CanvasEditorHandle>(null);

  // Preview modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // --- Image handlers ---
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImageError(null);

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setImageError("Format file harus JPEG, PNG, atau WebP.");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setImageError("Ukuran file tidak boleh lebih dari 2MB.");
        return;
      }

      // Validate dimensions
      const dimensionError = await validateImageDimensions(file);
      if (dimensionError) {
        setImageError(dimensionError);
        return;
      }

      // Clean up previous preview URL
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }

      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    },
    [imagePreviewUrl]
  );

  // --- Text placement handlers ---
  const handleAddText = useCallback(() => {
    const newElement: ITextElement = {
      id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      content: "New Text",
      position_x: 50,
      position_y: 50,
      font_size: 24,
      font_color: "#FFFFFF",
      font_weight: "bold",
    };
    setTextElements((prev) => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  }, []);

  const handleTextElementUpdate = useCallback((updated: ITextElement) => {
    setTextElements((prev) =>
      prev.map((el) => (el.id === updated.id ? updated : el))
    );
  }, []);

  const handleTextElementRemove = useCallback(
    (id: string) => {
      setTextElements((prev) => prev.filter((el) => el.id !== id));
      if (selectedElementId === id) {
        setSelectedElementId(null);
      }
    },
    [selectedElementId]
  );

  const handleTemplateApply = useCallback(
    (
      elements: ITextElement[],
      templateCtaConfig?: ICtaConfig | null,
      templateBackgroundConfig?: IBackgroundConfig
    ) => {
      setTextElements(elements);
      setSelectedElementId(null);
      if (templateCtaConfig !== undefined) {
        setCtaConfig(templateCtaConfig);
      }
      if (templateBackgroundConfig) {
        setBackgroundConfig(templateBackgroundConfig);
      }
    },
    []
  );

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    try {
      setSubmitting(true);

      if (bannerType === "image") {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("type", "image");
        formData.append("_method", "PUT");
        if (targetUrl) {
          formData.append("target_url", targetUrl);
        }

        // Only include image if a new file was uploaded
        if (imageFile) {
          formData.append("image", imageFile);
        }

        const resp = await bannersService.update(initialData.id, formData);
        showNotification(resp.message, "success");
      } else {
        if (textElements.length === 0) {
          setFormErrors({
            text_elements: "Minimal satu text element diperlukan.",
          });
          setSubmitting(false);
          return;
        }

        // Capture the canvas editor as a PNG image
        const imageBlob = await canvasEditorRef.current?.captureImage();
        if (!imageBlob) {
          setFormErrors({ text_elements: "Gagal menghasilkan gambar banner." });
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("type", "text_placement");
        formData.append("_method", "PUT");
        formData.append(
          "image",
          new File([imageBlob], "banner.png", { type: "image/png" })
        );
        formData.append("background_config", JSON.stringify(backgroundConfig));
        formData.append(
          "text_elements",
          // Strip client-side `id` before sending to API
          JSON.stringify(
            textElements.map((el) => ({
              content: el.content,
              position_x: el.position_x,
              position_y: el.position_y,
              font_size: el.font_size,
              font_color: el.font_color,
              font_weight: el.font_weight,
            }))
          )
        );
        if (ctaConfig) {
          formData.append("cta_config", JSON.stringify(ctaConfig));
        }
        if (targetUrl) {
          formData.append("target_url", targetUrl);
        }

        const resp = await bannersService.update(initialData.id, formData);
        showNotification(resp.message, "success");
      }

      router.push(PATHS.banners);
    } catch (err: unknown) {
      handleFormError(err, setFormErrors);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Derived state ---
  const selectedElement =
    textElements.find((el) => el.id === selectedElementId) ?? null;

  /** For preview: use new file if uploaded, otherwise existing image URL */
  const previewImage: File | string | null =
    bannerType === "image"
      ? (imageFile ?? initialData.image_url ?? null)
      : null;

  return (
    <div className="w-full">
      <FormCard>
        <FormCardHeader
          title="Edit Banner"
          description="Update the banner details. For image banners, upload a new image only if you want to replace the current one."
          badge="Banner Management"
        />

        <form onSubmit={handleSubmit}>
          <FormCardBody>
            {/* Common fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormInput
                id="title"
                label="Banner Title"
                placeholder="e.g. Promo Akhir Tahun"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={formErrors.title}
                maxLength={100}
              />

              <FormSelect
                id="type"
                label="Banner Type"
                value={bannerType}
                onChange={() => {}} // Type is not editable on edit
                options={BANNER_TYPE_OPTIONS}
                disabled
              />
            </div>

            {/* Target URL — shown for both banner types */}
            <div className="mt-6">
              <FormInput
                id="target_url"
                label="Target URL"
                placeholder="https://... atau lingkarid://..."
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                error={formErrors.target_url}
              />
            </div>

            {/* Conditional rendering based on type */}
            {bannerType === "image" ? (
              <div className="mt-8 space-y-4">
                <div>
                  <p className="text-xs text-secondary-500 uppercase font-medium mb-2 tracking-wide">
                    Banner Image
                  </p>
                  <p className="text-xs text-secondary-400 mb-3">
                    JPEG, PNG, or WebP. Max 2MB. Recommended: {EXPECTED_WIDTH}x
                    {EXPECTED_HEIGHT}px (16:9). Leave unchanged to keep the
                    current image.
                  </p>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Upload banner image"
                  />

                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} className="mr-2" />
                    {imageFile ? "Change Image" : "Replace Image"}
                  </Button>

                  {/* Error messages */}
                  {(imageError || formErrors.image) && (
                    <div className="mt-2 flex items-center gap-1.5 text-error-600">
                      <AlertCircle size={14} />
                      <p className="text-xs font-medium">
                        {imageError || formErrors.image}
                      </p>
                    </div>
                  )}
                </div>

                {/* New image preview (if uploaded) */}
                {imagePreviewUrl && (
                  <div>
                    <p className="text-xs text-secondary-500 uppercase font-medium mb-2 tracking-wide">
                      New Image Preview
                    </p>
                    <div className="rounded-lg border border-border-subtle overflow-hidden inline-block">
                      <Image
                        src={imagePreviewUrl}
                        alt="New banner preview"
                        width={540}
                        height={304}
                        className="block w-full max-w-[540px] h-auto object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}

                {/* Current image (always show if exists) */}
                {initialData.image_url && !imagePreviewUrl && (
                  <div>
                    <p className="text-xs text-secondary-500 uppercase font-medium mb-2 tracking-wide">
                      Current Image
                    </p>
                    <div className="rounded-lg border border-border-subtle overflow-hidden inline-block">
                      <Image
                        src={initialData.image_url}
                        alt="Current banner image"
                        width={540}
                        height={304}
                        className="block w-full max-w-[540px] h-auto object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                {/* Text Placement Editor Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left sidebar: Background + Templates */}
                  <div className="space-y-6">
                    <BackgroundSelector
                      backgroundConfig={backgroundConfig}
                      onChange={setBackgroundConfig}
                    />
                    <TemplateSelector onApply={handleTemplateApply} />
                  </div>

                  {/* Center: Canvas + Add Text button */}
                  <div className="lg:col-span-2 space-y-4">
                    <CanvasEditor
                      ref={canvasEditorRef}
                      textElements={textElements}
                      backgroundConfig={backgroundConfig}
                      onTextElementsChange={setTextElements}
                      selectedElementId={selectedElementId}
                      onSelectElement={setSelectedElementId}
                      ctaConfig={ctaConfig}
                      onCtaConfigChange={setCtaConfig}
                    />

                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={handleAddText}
                      >
                        <Plus size={16} className="mr-2" />
                        Add Text
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsPreviewOpen(true)}
                      >
                        <Eye size={16} className="mr-2" />
                        Preview
                      </Button>
                    </div>

                    {formErrors.text_elements && (
                      <div className="flex items-center gap-1.5 text-error-600">
                        <AlertCircle size={14} />
                        <p className="text-xs font-medium">
                          {formErrors.text_elements}
                        </p>
                      </div>
                    )}

                    {/* Properties panel */}
                    {selectedElement && (
                      <div className="rounded-xl border border-border-subtle p-4 bg-neutral-50">
                        <TextPropertiesPanel
                          selectedElement={selectedElement}
                          onUpdate={handleTextElementUpdate}
                          onRemove={handleTextElementRemove}
                        />
                      </div>
                    )}

                    {/* CTA Properties panel */}
                    <div className="rounded-xl border border-border-subtle p-4 bg-neutral-50">
                      <CtaPropertiesPanel
                        ctaConfig={ctaConfig}
                        onUpdate={setCtaConfig}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview button for image type */}
            {bannerType === "image" &&
              (imagePreviewUrl || initialData.image_url) && (
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsPreviewOpen(true)}
                  >
                    <Eye size={16} className="mr-2" />
                    Preview
                  </Button>
                </div>
              )}

            <div className="pt-8" />
          </FormCardBody>

          <FormCardFooter>
            <Button
              type="button"
              variant="ghost"
              href={PATHS.banners}
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

      {/* Preview Modal */}
      <BannerPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        banner={{
          type: bannerType,
          image: previewImage,
          backgroundConfig:
            bannerType === "text_placement" ? backgroundConfig : null,
          textElements: bannerType === "text_placement" ? textElements : null,
          ctaConfig: bannerType === "text_placement" ? ctaConfig : null,
        }}
      />
    </div>
  );
}
