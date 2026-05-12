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
import { popupPromotionsService } from "@services/marketing/popup-promotions";
import type {
  IPopupPromotion,
  PopupContentType,
  ITriggerRule,
} from "@services/marketing/popup-promotions";
import {
  PopupCanvasEditor,
  PopupElementPanel,
  PopupBackgroundSelector,
  PopupTemplateSelector,
  PopupHtmlEditor,
  PopupPreviewModal,
  PopupImageInput,
} from "@app/components/ui/PopupEditor";
import type {
  TemplateSlots,
  PopupElement,
  PopupBackgroundConfig,
} from "@app/components/ui/PopupEditor";
import TriggerRulesBuilder from "../../_partials/TriggerRulesBuilder";

const CONTENT_TYPE_OPTIONS = [
  { label: "Template", value: "template" },
  { label: "Image Upload", value: "image" },
  { label: "Canvas Editor", value: "canvas" },
  { label: "HTML Code", value: "html" },
];

export default function PopupPromotionEditPage() {
  const params = useParams();
  const id = params.id as string;
  const fetcher = useCallback(() => popupPromotionsService.getById(id), [id]);
  const { data, isLoading, error } = useDetailData<IPopupPromotion>({
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
            backHref={PATHS.popupPromotions}
            backLabel="Back"
          />
        </FormCard>
      </div>
    );

  return <EditForm initialData={data} />;
}

function EditForm({ initialData }: { initialData: IPopupPromotion }) {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [name, setName] = useState(initialData.name);
  const [contentType, setContentType] = useState<PopupContentType>(
    initialData.content_type
  );
  const [priority, setPriority] = useState(Math.max(0, initialData.priority));
  const [contentConfig, setContentConfig] = useState<Record<string, unknown>>(
    initialData.content_config || {}
  );
  const [elements, setElements] = useState<PopupElement[]>(
    (initialData.content_config as { elements?: PopupElement[] })?.elements ||
      []
  );
  const [background, setBackground] = useState<PopupBackgroundConfig>(
    (initialData.content_config as { background?: PopupBackgroundConfig })
      ?.background || { mode: "solid", color: "#FFFFFF" }
  );
  const [canvasRatio, setCanvasRatio] = useState<number>(
    (initialData.content_config as { canvasRatio?: number })?.canvasRatio || 1
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [showBgPanel, setShowBgPanel] = useState(true);
  const [templateSlots, setTemplateSlots] = useState<TemplateSlots>(() => {
    const defaults: TemplateSlots = {
      template_id: "",
      headline: "",
      subtext: "",
      image_url: "",
      cta_text: "",
      cta_action: "",
      theme_color: "#667EEA",
    };
    const cfg =
      initialData.content_config as unknown as Partial<TemplateSlots> | null;
    if (!cfg) return defaults;
    return {
      ...defaults,
      ...Object.fromEntries(Object.entries(cfg).map(([k, v]) => [k, v ?? ""])),
    } as TemplateSlots;
  });
  const [htmlContent, setHtmlContent] = useState(
    (initialData.content_config as { html?: string })?.html || ""
  );
  const [triggerRules, setTriggerRules] = useState<ITriggerRule[]>(
    initialData.trigger_config?.rules || []
  );
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  const buildContentConfig = () => {
    if (contentType === "template") return { ...templateSlots };
    if (contentType === "html") return { html: htmlContent };
    if (contentType === "canvas") return { elements, background, canvasRatio };
    return contentConfig;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);
    try {
      const resp = await popupPromotionsService.update(initialData.id, {
        name,
        content_type: contentType,
        priority,
        content_config: buildContentConfig(),
        trigger_config: triggerRules.length
          ? { rules: triggerRules, combine: "and" }
          : undefined,
      });
      showNotification(resp.message, "success");
      router.push(PATHS.popupPromotions);
    } catch (err: unknown) {
      handleFormError(err, setFormErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <FormCard>
        <FormCardHeader
          title="Edit Popup"
          description={`Editing "${initialData.name}"`}
          badge="Popup Promotions"
        />
        <form onSubmit={handleSubmit}>
          <FormCardBody>
            <FormInput
              id="name"
              label="Popup Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={formErrors.name}
            />
            <FormSelect
              id="content_type"
              label="Content Type"
              value={contentType}
              onChange={(e) =>
                setContentType(e.target.value as PopupContentType)
              }
              options={CONTENT_TYPE_OPTIONS}
            />
            <FormInput
              id="priority"
              label="Priority"
              type="number"
              min={0}
              value={String(priority)}
              onChange={(e) => setPriority(Math.max(0, Number(e.target.value)))}
            />

            {/* Content Editor */}
            <div className="pt-4 border-t border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-700 mb-4">
                Content Editor
              </h3>
              {contentType === "canvas" && (
                <div className="space-y-3">
                  <PopupCanvasEditor
                    elements={elements}
                    background={background}
                    onElementsChange={setElements}
                    selectedElementId={selectedElementId}
                    onSelectElement={setSelectedElementId}
                    aspectRatio={canvasRatio}
                    onAspectRatioChange={setCanvasRatio}
                  />
                  {/* Floating background panel - left */}
                  <div
                    className={`fixed top-20 left-[calc(var(--sidebar-width,280px)+24px)] w-64 max-h-[calc(100vh-120px)] overflow-y-auto z-40 shadow-xl rounded-2xl bg-white border border-neutral-200 p-4 transition-all duration-300 ease-in-out ${showBgPanel ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8 pointer-events-none"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                        Canvas Background
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowBgPanel(false)}
                        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <PopupBackgroundSelector
                      value={background}
                      onChange={setBackground}
                    />
                  </div>
                  {!showBgPanel && (
                    <button
                      type="button"
                      onClick={() => setShowBgPanel(true)}
                      className="fixed top-20 left-[calc(var(--sidebar-width,280px)+24px)] z-40 px-3 py-2 text-xs font-medium bg-white border border-neutral-200 rounded-xl shadow-lg hover:bg-neutral-50 transition-all duration-200"
                    >
                      🎨 Background
                    </button>
                  )}
                  {/* Floating element properties panel - right */}
                  <div
                    className={`fixed top-20 right-6 w-72 max-h-[calc(100vh-120px)] overflow-y-auto z-40 shadow-xl rounded-2xl bg-white border border-neutral-200 transition-all duration-300 ease-in-out ${selectedElementId ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedElementId(null)}
                      className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors z-10"
                    >
                      ✕
                    </button>
                    <PopupElementPanel
                      element={
                        elements.find((el) => el.id === selectedElementId) ||
                        null
                      }
                      onChange={(updated) =>
                        setElements(
                          elements.map((el) =>
                            el.id === updated.id ? updated : el
                          )
                        )
                      }
                      onDelete={
                        selectedElementId
                          ? () => {
                              setElements(
                                elements.filter(
                                  (el) => el.id !== selectedElementId
                                )
                              );
                              setSelectedElementId(null);
                            }
                          : undefined
                      }
                    />
                  </div>
                </div>
              )}
              {contentType === "template" && (
                <div className="space-y-4">
                  <PopupTemplateSelector
                    value={templateSlots}
                    onChange={setTemplateSlots}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowPreview(true)}
                    className="w-full"
                  >
                    Preview Popup
                  </Button>
                  <PopupPreviewModal
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    contentType="template"
                    contentConfig={
                      templateSlots as unknown as Record<string, unknown>
                    }
                  />
                </div>
              )}
              {contentType === "html" && (
                <PopupHtmlEditor
                  value={htmlContent}
                  onChange={setHtmlContent}
                />
              )}
              {contentType === "image" && (
                <PopupImageInput
                  label="Popup Image"
                  value={
                    (initialData.content_config as { image_url?: string })
                      ?.image_url || ""
                  }
                  onChange={(url) =>
                    setContentConfig({ ...contentConfig, image_url: url })
                  }
                />
              )}
            </div>

            {/* Trigger Rules */}
            <div className="pt-4 border-t border-neutral-100">
              <TriggerRulesBuilder
                value={triggerRules}
                onChange={setTriggerRules}
              />
            </div>
          </FormCardBody>
          <FormCardFooter>
            <Button
              type="button"
              variant="ghost"
              href={PATHS.popupPromotions}
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
              <Check size={16} strokeWidth={2.5} className="mr-2" /> Update
              Popup
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
