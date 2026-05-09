"use client";

import { useCallback } from "react";
import { Button } from "@app/components/ui/Button";
import type {
  ITextElement,
  ICtaConfig,
  IBackgroundConfig,
} from "@services/marketing/banners/banners.types";

/** A banner template with pre-configured text elements, CTA, and background */
interface BannerTemplate {
  id: string;
  name: string;
  description: string;
  /** Pre-configured text elements (without id — ids are generated on apply) */
  elements: Omit<ITextElement, "id">[];
  ctaConfig?: ICtaConfig;
  backgroundConfig?: IBackgroundConfig;
}

/**
 * Pre-defined banner templates matching the mobile app's PromoBanner.
 * Templates 1-3 mirror the exact promo cards from the mobile app.
 * Template 4 is a generic centered layout.
 */
const BANNER_TEMPLATES: BannerTemplate[] = [
  {
    id: "cashback-20",
    name: "Cashback 20%",
    description: "Primary gradient — matches mobile Cashback promo",
    backgroundConfig: {
      type: "gradient",
      colors: ["#e46767", "#be2a2a", "#7f1c1c"],
      direction: "to-bottom-right",
    },
    elements: [
      {
        content: "Untuk deposit pertama kamu",
        position_x: 15,
        position_y: 28,
        font_size: 36,
        font_color: "#FFFFFFB3",
        font_weight: "normal",
      },
      {
        content: "Cashback 20%",
        position_x: 15,
        position_y: 50,
        font_size: 72,
        font_color: "#FFFFFF",
        font_weight: "bold",
      },
    ],
    ctaConfig: {
      text: "Klaim Sekarang",
      position_x: 15,
      position_y: 78,
      bg_color: "#FFFFFF33",
      text_color: "#FFFFFF",
      border_radius: 50,
      font_size: 32,
      padding_x: 48,
      padding_y: 20,
    },
  },
  {
    id: "gratis-transfer",
    name: "Gratis Transfer",
    description: "Tertiary gradient — matches mobile Transfer promo",
    backgroundConfig: {
      type: "gradient",
      colors: ["#368fb2", "#26647f"],
      direction: "to-bottom-right",
    },
    elements: [
      {
        content: "10x transfer gratis bulan ini",
        position_x: 15,
        position_y: 28,
        font_size: 36,
        font_color: "#FFFFFFB3",
        font_weight: "normal",
      },
      {
        content: "Gratis Transfer",
        position_x: 15,
        position_y: 50,
        font_size: 72,
        font_color: "#FFFFFF",
        font_weight: "bold",
      },
    ],
    ctaConfig: {
      text: "Lihat Detail",
      position_x: 15,
      position_y: 78,
      bg_color: "#FFFFFF33",
      text_color: "#FFFFFF",
      border_radius: 50,
      font_size: 32,
      padding_x: 48,
      padding_y: 20,
    },
  },
  {
    id: "referral-bonus",
    name: "Referral Bonus",
    description: "Dark gradient — matches mobile Referral promo",
    backgroundConfig: {
      type: "gradient",
      colors: ["#4f4f4f", "#222222"],
      direction: "to-bottom-right",
    },
    elements: [
      {
        content: "Ajak teman, dapat Rp 50.000",
        position_x: 15,
        position_y: 28,
        font_size: 36,
        font_color: "#FFFFFFB3",
        font_weight: "normal",
      },
      {
        content: "Referral Bonus",
        position_x: 15,
        position_y: 50,
        font_size: 72,
        font_color: "#FFFFFF",
        font_weight: "bold",
      },
    ],
    ctaConfig: {
      text: "Bagikan Link",
      position_x: 15,
      position_y: 78,
      bg_color: "#FFFFFF33",
      text_color: "#FFFFFF",
      border_radius: 50,
      font_size: 32,
      padding_x: 48,
      padding_y: 20,
    },
  },
  {
    id: "promo-spesial",
    name: "Promo Spesial",
    description: "Generic centered promo with purple gradient",
    backgroundConfig: {
      type: "gradient",
      colors: ["#667EEA", "#764BA2"],
      direction: "to-right",
    },
    elements: [
      {
        content: "Penawaran terbatas",
        position_x: 50,
        position_y: 22,
        font_size: 36,
        font_color: "#FFFFFFB3",
        font_weight: "normal",
      },
      {
        content: "Promo Spesial",
        position_x: 50,
        position_y: 45,
        font_size: 72,
        font_color: "#FFFFFF",
        font_weight: "bold",
      },
      {
        content: "Berlaku hingga akhir bulan",
        position_x: 50,
        position_y: 63,
        font_size: 30,
        font_color: "#FFFFFFB3",
        font_weight: "normal",
      },
    ],
    ctaConfig: {
      text: "Selengkapnya",
      position_x: 50,
      position_y: 84,
      bg_color: "#FFFFFF33",
      text_color: "#FFFFFF",
      border_radius: 50,
      font_size: 32,
      padding_x: 48,
      padding_y: 20,
    },
  },
];

interface TemplateSelectorProps {
  onApply: (
    textElements: ITextElement[],
    ctaConfig?: ICtaConfig | null,
    backgroundConfig?: IBackgroundConfig
  ) => void;
}

/**
 * Renders a mini preview of a template's layout on its background.
 * Shows text elements and CTA button placement.
 */
function TemplateThumbnail({ template }: { template: BannerTemplate }) {
  const bgStyle: React.CSSProperties = template.backgroundConfig
    ? template.backgroundConfig.type === "gradient" &&
      template.backgroundConfig.colors.length >= 2
      ? {
          background: `linear-gradient(${
            template.backgroundConfig.direction === "to-bottom"
              ? "to bottom"
              : template.backgroundConfig.direction === "to-bottom-right"
                ? "to bottom right"
                : "to right"
          }, ${template.backgroundConfig.colors.join(", ")})`,
        }
      : { backgroundColor: template.backgroundConfig.colors[0] || "#6B7280" }
    : { backgroundColor: "#6B7280" };

  return (
    <div
      className="w-full aspect-video rounded-md relative overflow-hidden"
      style={bgStyle}
      aria-hidden="true"
    >
      {template.elements.map((el, idx) => {
        const thumbnailFontSize = Math.max(6, Math.round(el.font_size * 0.1));
        const isLeftAligned = el.position_x < 50;
        return (
          <div
            key={idx}
            className="absolute whitespace-nowrap overflow-hidden"
            style={{
              left: `${el.position_x}%`,
              top: `${el.position_y}%`,
              transform: isLeftAligned
                ? "translateY(-50%)"
                : "translate(-50%, -50%)",
              textAlign: isLeftAligned ? "left" : "center",
              fontSize: `${thumbnailFontSize}px`,
              fontWeight:
                el.font_weight === "bold"
                  ? 700
                  : el.font_weight === "semibold"
                    ? 600
                    : 400,
              color: el.font_color,
              maxWidth: "80%",
              lineHeight: 1.2,
            }}
          >
            {el.content}
          </div>
        );
      })}
      {template.ctaConfig && (
        <div
          className="absolute whitespace-nowrap overflow-hidden"
          style={{
            left: `${template.ctaConfig.position_x}%`,
            top: `${template.ctaConfig.position_y}%`,
            transform:
              template.ctaConfig.position_x < 50
                ? "translateY(-50%)"
                : "translate(-50%, -50%)",
            backgroundColor: template.ctaConfig.bg_color,
            color: template.ctaConfig.text_color,
            borderRadius: `${Math.round(template.ctaConfig.border_radius * 0.1)}px`,
            fontSize: `${Math.max(5, Math.round(template.ctaConfig.font_size * 0.1))}px`,
            paddingLeft: `${Math.max(2, Math.round(template.ctaConfig.padding_x * 0.1))}px`,
            paddingRight: `${Math.max(2, Math.round(template.ctaConfig.padding_x * 0.1))}px`,
            paddingTop: `${Math.max(1, Math.round(template.ctaConfig.padding_y * 0.1))}px`,
            paddingBottom: `${Math.max(1, Math.round(template.ctaConfig.padding_y * 0.1))}px`,
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {template.ctaConfig.text}
        </div>
      )}
    </div>
  );
}

/**
 * Template selector for text placement banners.
 * Displays a grid of template options with thumbnail previews.
 * Applying a template replaces text elements, CTA config, and background config.
 */
export default function TemplateSelector({ onApply }: TemplateSelectorProps) {
  const handleApply = useCallback(
    (template: BannerTemplate) => {
      const elements: ITextElement[] = template.elements.map((el, idx) => ({
        ...el,
        id: `${template.id}-${idx}-${Date.now()}`,
      }));
      onApply(elements, template.ctaConfig ?? null, template.backgroundConfig);
    },
    [onApply]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-secondary-800">Templates</h3>

      <div className="grid grid-cols-2 gap-3">
        {BANNER_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="group rounded-xl border border-border-subtle overflow-hidden hover:border-primary-400 transition-colors"
          >
            <TemplateThumbnail template={template} />
            <div className="p-2.5 space-y-1.5">
              <p className="text-xs font-semibold text-secondary-800">
                {template.name}
              </p>
              <p className="text-[11px] text-secondary-500 leading-tight">
                {template.description}
              </p>
              <Button
                type="button"
                variant="outlined"
                size="sm"
                className="w-full text-xs"
                onClick={() => handleApply(template)}
              >
                Apply Template
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Export templates constant for testing */
export { BANNER_TEMPLATES };
export type { BannerTemplate };
