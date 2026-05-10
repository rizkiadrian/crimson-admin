"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
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
import { popupPromotionsService } from "@services/marketing/popup-promotions";
import type {
  PopupContentType,
  IPopupPromotionCreatePayload,
  ITriggerRule,
} from "@services/marketing/popup-promotions";
import {
  PopupTemplateSelector,
  PopupHtmlEditor,
} from "@app/components/ui/PopupEditor";
import type { TemplateSlots } from "@app/components/ui/PopupEditor";
import TriggerRulesBuilder from "../_partials/TriggerRulesBuilder";

const CONTENT_TYPE_OPTIONS = [
  { label: "Template", value: "template" },
  { label: "Image Upload", value: "image" },
  { label: "Canvas Editor", value: "canvas" },
  { label: "HTML Code", value: "html" },
];

const STEPS = ["Basic Info", "Content", "Targeting", "Scheduling", "Review"];

export default function PopupPromotionCreatePage() {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form state
  const [name, setName] = useState("");
  const [contentType, setContentType] = useState<PopupContentType>("template");
  const [priority, setPriority] = useState(0);
  const [contentConfig, setContentConfig] = useState<Record<string, unknown>>(
    {}
  );
  const [templateSlots, setTemplateSlots] = useState<TemplateSlots>({
    template_id: "",
    headline: "",
    subtext: "",
    image_url: "",
    cta_text: "",
    cta_action: "",
    theme_color: "#667EEA",
  });
  const [htmlContent, setHtmlContent] = useState("");

  // Targeting
  const [userTypes, setUserTypes] = useState<string[]>([]);
  const [journeyStages, setJourneyStages] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [triggerRules, setTriggerRules] = useState<ITriggerRule[]>([]);

  // Scheduling
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const buildPayload = (): IPopupPromotionCreatePayload => {
    let config = contentConfig;
    if (contentType === "template") config = { ...templateSlots };
    if (contentType === "html") config = { html: htmlContent };

    return {
      name,
      content_type: contentType,
      content_config: config,
      priority,
      target_config: {
        user_types: userTypes.length ? userTypes : undefined,
        journey_stages: journeyStages.length ? journeyStages : undefined,
        platforms: platforms.length ? platforms : undefined,
      },
      schedule_config: startDate
        ? { start_date: startDate, end_date: endDate || null }
        : undefined,
      trigger_config: triggerRules.length
        ? { rules: triggerRules, combine: "and" as const }
        : undefined,
    };
  };

  const handleSubmit = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      const resp = await popupPromotionsService.create(buildPayload());
      showNotification(resp.message, "success");
      router.push(PATHS.popupPromotions);
    } catch (err: unknown) {
      handleFormError(err, setFormErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleArray = (
    arr: string[],
    val: string,
    setter: (v: string[]) => void
  ) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  return (
    <div className="w-full">
      <FormCard>
        <FormCardHeader
          title="Create Popup Promotion"
          description={`Step ${step + 1}: ${STEPS[step]}`}
          badge="Popup Promotions"
        />

        <FormCardBody>
          {/* Step indicators */}
          <div className="flex gap-1 mb-6">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full ${i <= step ? "bg-primary-500" : "bg-neutral-200"}`}
              />
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 0 && (
            <div className="space-y-4">
              <FormInput
                id="name"
                label="Popup Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={formErrors.name}
                placeholder="e.g. Welcome Promo Q2"
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
                value={String(priority)}
                onChange={(e) => setPriority(Number(e.target.value))}
                error={formErrors.priority}
              />
            </div>
          )}

          {/* Step 2: Content */}
          {step === 1 && (
            <div>
              {contentType === "template" && (
                <PopupTemplateSelector
                  value={templateSlots}
                  onChange={setTemplateSlots}
                />
              )}
              {contentType === "html" && (
                <PopupHtmlEditor
                  value={htmlContent}
                  onChange={setHtmlContent}
                />
              )}
              {contentType === "image" && (
                <FormInput
                  id="image_url"
                  label="Image URL"
                  value={(contentConfig.image_url as string) || ""}
                  onChange={(e) =>
                    setContentConfig({
                      ...contentConfig,
                      image_url: e.target.value,
                    })
                  }
                  placeholder="https://..."
                />
              )}
              {contentType === "canvas" && (
                <div className="p-8 text-center border border-dashed border-neutral-300 rounded-xl">
                  <p className="text-sm text-neutral-500">
                    Canvas editor available in edit mode after saving.
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Save as draft first, then edit to use the full canvas
                    editor.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Targeting */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  User Type
                </label>
                <div className="flex gap-2">
                  {["client", "mitra"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleArray(userTypes, t, setUserTypes)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${userTypes.includes(t) ? "bg-primary-50 border-primary-500 text-primary-700" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Journey Stage
                </label>
                <div className="flex flex-wrap gap-2">
                  {["registered", "verified", "funded", "active"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        toggleArray(journeyStages, s, setJourneyStages)
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${journeyStages.includes(s) ? "bg-primary-50 border-primary-500 text-primary-700" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Platform
                </label>
                <div className="flex gap-2">
                  {["android", "ios"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleArray(platforms, p, setPlatforms)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${platforms.includes(p) ? "bg-primary-50 border-primary-500 text-primary-700" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}
                    >
                      {p === "ios" ? "iOS" : "Android"}
                    </button>
                  ))}
                </div>
              </div>
              <TriggerRulesBuilder
                value={triggerRules}
                onChange={setTriggerRules}
              />
            </div>
          )}

          {/* Step 4: Scheduling */}
          {step === 3 && (
            <div className="space-y-4 min-h-96">
              <FormInput
                id="start_date"
                label="Start Date"
                format="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <FormInput
                id="end_date"
                label="End Date (optional)"
                format="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          {/* Step 5: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    Popup Name
                  </p>
                  <p className="text-[15px] font-semibold text-neutral-900">
                    {name || (
                      <span className="text-neutral-400 italic">Not set</span>
                    )}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    Content Type
                  </p>
                  <p className="text-[15px] font-semibold text-neutral-900 capitalize">
                    {contentType}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    Priority
                  </p>
                  <p className="text-[15px] font-semibold text-neutral-900">
                    {priority}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    Target Audience
                  </p>
                  <p className="text-[15px] font-semibold text-neutral-900">
                    {userTypes.join(", ") || "All users"}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    Journey Stage
                  </p>
                  <p className="text-[15px] font-semibold text-neutral-900">
                    {journeyStages.join(", ") || "All stages"}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    Platform
                  </p>
                  <p className="text-[15px] font-semibold text-neutral-900">
                    {platforms.join(", ") || "All platforms"}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100 md:col-span-2">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    Schedule
                  </p>
                  <p className="text-[15px] font-semibold text-neutral-900">
                    {startDate
                      ? `${startDate}${endDate ? ` → ${endDate}` : " (no end date)"}`
                      : "No schedule (will save as draft)"}
                  </p>
                </div>
              </div>
              {formErrors.name && (
                <p className="text-sm text-error-600 mt-2">{formErrors.name}</p>
              )}
            </div>
          )}
        </FormCardBody>

        <FormCardFooter>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              href={PATHS.popupPromotions}
              className="px-6 font-medium"
            >
              Cancel
            </Button>
            {step > 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(step - 1)}
                className="px-4"
              >
                <ChevronLeft size={16} className="mr-1" /> Back
              </Button>
            )}
          </div>
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              onClick={() => setStep(step + 1)}
              className="px-6 shadow-md shadow-primary-200/60"
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              isLoading={submitting}
              className="px-8 shadow-md shadow-primary-200/60"
            >
              <Check size={16} strokeWidth={2.5} className="mr-2" /> Create
              Popup
            </Button>
          )}
        </FormCardFooter>
      </FormCard>
    </div>
  );
}
