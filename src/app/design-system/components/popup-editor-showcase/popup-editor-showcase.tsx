"use client";

import { useState } from "react";
import {
  PopupColorPicker,
  PopupGradientEditor,
  PopupBackgroundSelector,
  PopupTemplateSelector,
  PopupHtmlEditor,
  PopupPreviewModal,
} from "@app/components/ui/PopupEditor";
import type { GradientConfig } from "@app/components/ui/PopupEditor";
import type { PopupBackgroundConfig } from "@app/components/ui/PopupEditor";
import type { TemplateSlots } from "@app/components/ui/PopupEditor";
import { Button } from "@app/components/ui/Button";

const DEFAULT_GRADIENT: GradientConfig = {
  type: "linear",
  angle: 135,
  stops: [
    { color: "#667eea", position: 0 },
    { color: "#764ba2", position: 100 },
  ],
};

const DEFAULT_BG: PopupBackgroundConfig = {
  mode: "gradient",
  gradient: DEFAULT_GRADIENT,
};

const DEFAULT_SLOTS: TemplateSlots = {
  template_id: "welcome_offer",
  headline: "Welcome!",
  subtext: "Get 20% off your first order",
  image_url: "",
  cta_text: "Claim Now",
  cta_action: "deeplink://promo",
  theme_color: "#667eea",
};

export function PopupEditorShowcase() {
  const [color, setColor] = useState("#667eea");
  const [gradient, setGradient] = useState<GradientConfig>(DEFAULT_GRADIENT);
  const [background, setBackground] =
    useState<PopupBackgroundConfig>(DEFAULT_BG);
  const [slots, setSlots] = useState<TemplateSlots>(DEFAULT_SLOTS);
  const [showPreview, setShowPreview] = useState(false);
  const [htmlContent, setHtmlContent] = useState(
    '<div style="padding:24px;text-align:center">\n  <h2>Welcome!</h2>\n  <p>Get {{voucher_code}} off your first order</p>\n</div>'
  );

  return (
    <div className="space-y-8">
      <p className="text-secondary-600">
        Components for building in-app popup promotions: color picker, gradient
        editor, background selector, template selector, HTML editor, and preview
        modal.
      </p>

      {/* Color Picker */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-secondary-800">
          PopupColorPicker
        </h3>
        <div className="bg-white rounded-lg p-6 max-w-sm">
          <PopupColorPicker
            label="Primary Color"
            value={color}
            onChange={setColor}
            showOpacity
          />
          <p className="mt-3 text-sm text-secondary-500">Selected: {color}</p>
        </div>
      </div>

      {/* Gradient Editor */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-secondary-800">
          PopupGradientEditor
        </h3>
        <div className="bg-white rounded-lg p-6 max-w-md">
          <PopupGradientEditor value={gradient} onChange={setGradient} />
        </div>
      </div>

      {/* Background Selector */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-secondary-800">
          PopupBackgroundSelector
        </h3>
        <div className="bg-white rounded-lg p-6 max-w-md">
          <PopupBackgroundSelector
            value={background}
            onChange={setBackground}
          />
        </div>
      </div>

      {/* Template Selector */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-secondary-800">
          PopupTemplateSelector
        </h3>
        <div className="bg-white rounded-lg p-6">
          <PopupTemplateSelector value={slots} onChange={setSlots} />
        </div>
      </div>

      {/* HTML Editor */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-secondary-800">
          PopupHtmlEditor
        </h3>
        <div className="bg-white rounded-lg p-6">
          <PopupHtmlEditor value={htmlContent} onChange={setHtmlContent} />
        </div>
      </div>

      {/* Preview Modal */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-secondary-800">
          PopupPreviewModal
        </h3>
        <Button onClick={() => setShowPreview(true)}>Open Preview</Button>
        <PopupPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          contentType="html"
          contentConfig={{ html: htmlContent }}
        />
      </div>
    </div>
  );
}
