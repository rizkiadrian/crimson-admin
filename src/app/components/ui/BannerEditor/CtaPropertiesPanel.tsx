"use client";

import { useCallback } from "react";
import { FormInput } from "@app/components/ui/FormInput";
import { Button } from "@app/components/ui/Button";
import type { ICtaConfig } from "@services/backoffice/banners/banners.types";

/** Default CTA config when enabling the CTA button */
const DEFAULT_CTA_CONFIG: ICtaConfig = {
  text: "Selengkapnya",
  position_x: 50,
  position_y: 84,
  bg_color: "#FFFFFF33",
  text_color: "#FFFFFF",
  border_radius: 50,
  font_size: 32,
  padding_x: 48,
  padding_y: 20,
};

interface CtaPropertiesPanelProps {
  ctaConfig: ICtaConfig | null;
  onUpdate: (config: ICtaConfig | null) => void;
}

/**
 * Properties panel for editing the CTA (Call-to-Action) button on text placement banners.
 * Follows the same pattern as TextPropertiesPanel.
 */
export default function CtaPropertiesPanel({
  ctaConfig,
  onUpdate,
}: CtaPropertiesPanelProps) {
  const handleToggle = useCallback(() => {
    if (ctaConfig) {
      onUpdate(null);
    } else {
      onUpdate({ ...DEFAULT_CTA_CONFIG });
    }
  }, [ctaConfig, onUpdate]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      if (!ctaConfig) return;

      const { id: fieldId, value } = e.target;
      const updated: ICtaConfig = { ...ctaConfig };

      switch (fieldId) {
        case "cta-text":
          updated.text = value.slice(0, 50);
          break;
        case "cta-bg-color":
          updated.bg_color = value;
          break;
        case "cta-text-color":
          updated.text_color = value;
          break;
        case "cta-border-radius":
          updated.border_radius = Math.min(50, Math.max(0, Number(value) || 0));
          break;
        case "cta-font-size":
          updated.font_size = Math.min(36, Math.max(10, Number(value) || 10));
          break;
        case "cta-padding-x":
          updated.padding_x = Math.min(60, Math.max(8, Number(value) || 8));
          break;
        case "cta-padding-y":
          updated.padding_y = Math.min(30, Math.max(4, Number(value) || 4));
          break;
      }

      onUpdate(updated);
    },
    [ctaConfig, onUpdate]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-secondary-800">CTA Button</h3>
        <Button
          type="button"
          variant={ctaConfig ? "outlined" : "primary"}
          size="sm"
          onClick={handleToggle}
        >
          {ctaConfig ? "Disable CTA" : "Enable CTA"}
        </Button>
      </div>

      {ctaConfig && (
        <>
          <FormInput
            id="cta-text"
            label="Button Text"
            value={ctaConfig.text}
            onChange={handleChange}
            placeholder="e.g. Selengkapnya"
            maxLength={50}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="cta-bg-color"
              label="Background Color"
              value={ctaConfig.bg_color}
              onChange={handleChange}
              placeholder="#FFFFFF33"
            />
            <FormInput
              id="cta-text-color"
              label="Text Color"
              value={ctaConfig.text_color}
              onChange={handleChange}
              placeholder="#FFFFFF"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormInput
              id="cta-border-radius"
              label="Border Radius"
              type="number"
              value={String(ctaConfig.border_radius)}
              onChange={handleChange}
              min={0}
              max={50}
              placeholder="0-50"
            />
            <FormInput
              id="cta-font-size"
              label="Font Size"
              type="number"
              value={String(ctaConfig.font_size)}
              onChange={handleChange}
              min={10}
              max={36}
              placeholder="10-36"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="cta-padding-x"
              label="Padding X"
              type="number"
              value={String(ctaConfig.padding_x)}
              onChange={handleChange}
              min={8}
              max={60}
              placeholder="8-60"
            />
            <FormInput
              id="cta-padding-y"
              label="Padding Y"
              type="number"
              value={String(ctaConfig.padding_y)}
              onChange={handleChange}
              min={4}
              max={30}
              placeholder="4-30"
            />
          </div>
        </>
      )}
    </div>
  );
}

export { DEFAULT_CTA_CONFIG };
