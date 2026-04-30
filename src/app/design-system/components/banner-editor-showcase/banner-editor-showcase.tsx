"use client";

import { useState, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@app/components/ui/Button";
import {
  CanvasEditor,
  TextPropertiesPanel,
  CtaPropertiesPanel,
  BackgroundSelector,
  TemplateSelector,
  BannerPreviewModal,
} from "@app/components/ui/BannerEditor";
import type { CanvasEditorHandle } from "@app/components/ui/BannerEditor";
import type {
  ITextElement,
  IBackgroundConfig,
  ICtaConfig,
} from "@services/backoffice/banners/banners.types";

// ─── Default State ──────────────────────────────────────────────────────────────

const DEFAULT_TEXT_ELEMENTS: ITextElement[] = [
  {
    id: "demo-1",
    content: "Untuk deposit pertama kamu",
    position_x: 15,
    position_y: 28,
    font_size: 36,
    font_color: "#FFFFFFB3",
    font_weight: "normal",
  },
  {
    id: "demo-2",
    content: "Cashback 20%",
    position_x: 15,
    position_y: 50,
    font_size: 72,
    font_color: "#FFFFFF",
    font_weight: "bold",
  },
];

const DEFAULT_BG: IBackgroundConfig = {
  type: "gradient",
  colors: ["#e46767", "#be2a2a", "#7f1c1c"],
  direction: "to-bottom-right",
};

const DEFAULT_CTA: ICtaConfig = {
  text: "Klaim Sekarang",
  position_x: 15,
  position_y: 78,
  bg_color: "#FFFFFF33",
  text_color: "#FFFFFF",
  border_radius: 50,
  font_size: 32,
  padding_x: 48,
  padding_y: 20,
};

// ─── Showcase ───────────────────────────────────────────────────────────────────

/**
 * Interactive showcase for the BannerEditor component system.
 * Demonstrates the canvas editor, property panels, background selector,
 * template selector, and preview modal.
 */
export function BannerEditorShowcase() {
  const editorRef = useRef<CanvasEditorHandle>(null);

  const [textElements, setTextElements] = useState<ITextElement[]>(
    DEFAULT_TEXT_ELEMENTS
  );
  const [backgroundConfig, setBackgroundConfig] =
    useState<IBackgroundConfig>(DEFAULT_BG);
  const [ctaConfig, setCtaConfig] = useState<ICtaConfig | null>(DEFAULT_CTA);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [showPreview, setShowPreview] = useState(false);

  const selectedElement =
    textElements.find((el) => el.id === selectedElementId) ?? null;

  const handleAddText = useCallback(() => {
    const newEl: ITextElement = {
      id: `text-${Date.now()}`,
      content: "New Text",
      position_x: 50,
      position_y: 50,
      font_size: 36,
      font_color: "#FFFFFF",
      font_weight: "normal",
    };
    setTextElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  }, []);

  const handleUpdateElement = useCallback((updated: ITextElement) => {
    setTextElements((prev) =>
      prev.map((el) => (el.id === updated.id ? updated : el))
    );
  }, []);

  const handleRemoveElement = useCallback(
    (id: string) => {
      setTextElements((prev) => prev.filter((el) => el.id !== id));
      if (selectedElementId === id) setSelectedElementId(null);
    },
    [selectedElementId]
  );

  const handleApplyTemplate = useCallback(
    (
      elements: ITextElement[],
      cta?: ICtaConfig | null,
      bg?: IBackgroundConfig
    ) => {
      setTextElements(elements);
      setCtaConfig(cta ?? null);
      if (bg) setBackgroundConfig(bg);
      setSelectedElementId(null);
    },
    []
  );

  return (
    <div className="space-y-8">
      {/* Main Editor Area */}
      <div className="bg-bg-card rounded-2xl border border-border-subtle p-6">
        <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-4">
          Canvas Editor (Interactive — drag text, double-click to edit)
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2 space-y-3">
            <CanvasEditor
              ref={editorRef}
              textElements={textElements}
              backgroundConfig={backgroundConfig}
              onTextElementsChange={setTextElements}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              ctaConfig={ctaConfig}
              onCtaConfigChange={setCtaConfig}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outlined"
                size="sm"
                onClick={handleAddText}
              >
                <Plus size={14} className="mr-1.5" />
                Add Text
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                Preview Mobile
              </Button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6 overflow-y-auto max-h-[500px] pr-1">
            <TextPropertiesPanel
              selectedElement={selectedElement}
              onUpdate={handleUpdateElement}
              onRemove={handleRemoveElement}
            />
            <CtaPropertiesPanel ctaConfig={ctaConfig} onUpdate={setCtaConfig} />
          </div>
        </div>
      </div>

      {/* Background Selector + Template Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-bg-card rounded-2xl border border-border-subtle p-6">
          <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-4">
            Background Selector
          </p>
          <BackgroundSelector
            backgroundConfig={backgroundConfig}
            onChange={setBackgroundConfig}
          />
        </div>

        <div className="bg-bg-card rounded-2xl border border-border-subtle p-6">
          <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-4">
            Template Selector
          </p>
          <TemplateSelector onApply={handleApplyTemplate} />
        </div>
      </div>

      {/* Preview Modal */}
      <BannerPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        banner={{
          type: "text_placement",
          backgroundConfig,
          textElements,
          ctaConfig,
        }}
      />
    </div>
  );
}
