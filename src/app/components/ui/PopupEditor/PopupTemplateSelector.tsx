"use client";

import { cn } from "@lib/utils";
import { FormInput } from "@app/components/ui/FormInput";
import PopupColorPicker from "./PopupColorPicker";
import PopupImageInput from "./PopupImageInput";

export interface PopupTemplate {
  id: string;
  name: string;
  description: string;
  layout: string;
}

export const POPUP_TEMPLATES: PopupTemplate[] = [
  {
    id: "welcome_offer",
    name: "Welcome Offer",
    description: "Image + headline + subtext + CTA",
    layout: "image_top",
  },
  {
    id: "flash_sale",
    name: "Flash Sale",
    description: "Countdown + bold headline + CTA",
    layout: "countdown",
  },
  {
    id: "voucher_promo",
    name: "Voucher Promo",
    description: "Voucher code display + CTA",
    layout: "voucher",
  },
  {
    id: "announcement",
    name: "Announcement",
    description: "Icon + text + dismiss",
    layout: "simple",
  },
];

export interface TemplateSlots {
  template_id: string;
  headline: string;
  subtext: string;
  image_url: string;
  cta_text: string;
  cta_action: string;
  theme_color: string;
}

interface PopupTemplateSelectorProps {
  value: TemplateSlots;
  onChange: (slots: TemplateSlots) => void;
}

export default function PopupTemplateSelector({
  value,
  onChange,
}: PopupTemplateSelectorProps) {
  const update = (field: keyof TemplateSlots, val: string) =>
    onChange({ ...value, [field]: val });

  return (
    <div className="space-y-6">
      {/* Template Gallery */}
      <div>
        <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide mb-2 block">
          Choose Template
        </label>
        <div className="grid grid-cols-2 gap-3">
          {POPUP_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => update("template_id", t.id)}
              className={cn(
                "p-4 border rounded-xl text-left transition-all",
                value.template_id === t.id
                  ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                  : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              <p className="text-sm font-semibold text-neutral-800">{t.name}</p>
              <p className="text-xs text-neutral-500 mt-1">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Slot Fields */}
      {value.template_id && (
        <div className="space-y-4 border-t border-neutral-100 pt-4">
          <FormInput
            id="tpl-headline"
            label="Headline"
            value={value.headline}
            onChange={(e) => update("headline", e.target.value)}
            placeholder="Diskon 50% untuk order pertama!"
          />
          <FormInput
            id="tpl-subtext"
            label="Subtext"
            value={value.subtext}
            onChange={(e) => update("subtext", e.target.value)}
            placeholder="Berlaku sampai akhir bulan"
          />
          <PopupImageInput
            label="Image"
            value={value.image_url}
            onChange={(url) => update("image_url", url)}
          />
          <FormInput
            id="tpl-cta-text"
            label="CTA Button Text"
            value={value.cta_text}
            onChange={(e) => update("cta_text", e.target.value)}
            placeholder="Pesan Sekarang"
          />
          <FormInput
            id="tpl-cta-action"
            label="CTA Action (deeplink)"
            value={value.cta_action}
            onChange={(e) => update("cta_action", e.target.value)}
            placeholder="lingkar://services/cleaning"
          />
          <PopupColorPicker
            label="Theme Color"
            value={value.theme_color || "#667EEA"}
            onChange={(color) => update("theme_color", color)}
          />
        </div>
      )}
    </div>
  );
}
